require('dotenv').config()
const { load } = require('cheerio/slim')
const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const COOKIE_FILE = path.join(__dirname, 'cookies.json')
const URL_LOGIN = 'https://quali.joinbank.com.br/sign-in'
const URL_CONSULTA = 'https://quali.joinbank.com.br/inss-balances'

const usuario = process.env.LOGIN_USUARIO
const senha = process.env.LOGIN_SENHA

// HEADLESS=false mostra o navegador, caso contrario roda em modo oculto
const HEADLESS = process.env.HEADLESS !== 'false'

// Cookies
async function saveCookies(page) {
  const cookies = await page.cookies()
  fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2))
  console.log('cookies salvos com sucesso ')
}

async function loadCookies(page) {
  if (fs.existsSync(COOKIE_FILE)) {
    const cookiesJSON = fs.readFileSync(COOKIE_FILE, 'utf-8')
    const cookies = JSON.parse(cookiesJSON)
    await page.setCookie(...cookies)
    console.log('cookies setados')
    return true
  }
  return false
}

// Sessao e Login
async function isValidSession(page) {
  await page.goto(URL_CONSULTA, { waitUntil: 'networkidle2' })

  // sessao valida apenas se estiver na pagina de consultas
  return page.url().includes('/inss-balances')
}

async function validaSession(page) {
  const cookiesLoaded = await loadCookies(page)
  let sessionValid = false
  await page.goto(URL_CONSULTA)

  if (cookiesLoaded) {
    sessionValid = await isValidSession(page)
    if (!sessionValid) {
      console.log('sessao expirou , revalidando cookies')
      fs.unlinkSync(COOKIE_FILE)
    }
  }

  return sessionValid
}

async function userLogin(page) {
  await page.goto(URL_LOGIN)

  //digita o usuario
  const usuarioInput = page.locator('#accessId')
  await usuarioInput.fill(usuario)

  // //digita senha
  const senhaInput = page.locator('#password')
  await senhaInput.fill(senha)

  //clica em entrar
  await page
    .locator('span[class="ng-tns-c3363647615-1 ng-star-inserted"]')
    .click()

  //espera o login terminar para salvar os cookies
  await page.waitForNavigation({ waitUntil: 'networkidle2' })
  await saveCookies(page)
}

// Consulta
async function fillConsultationForm(page, dados) {
  //abre a side bar de consultas
  const sideConsultas = page.locator('mat-icon[svgicon="mat_outline:menu"]')
  await sideConsultas.click()

  //localiza e clica no botao de consultain100
  const in100Button = page.locator('span[class="mat-mdc-button-touch-target"]')
  await in100Button.click()

  // //localiza e digita o input nome
  const nameInput = page.locator('input[name="name"]')
  await nameInput.fill(dados.nome)

  // //localiza e digita o cpf
  const cpfInput = page.locator('input[name="identity"]')
  await cpfInput.fill(dados.cpf)

  // //localiza e digita o numero de beneficio
  const benefitInput = page.locator('input[name="benefit"]')
  await benefitInput.fill(dados.beneficio)

  //localiza e clica em confirmar busca de beneficio

  // 1. desmarca o checkbox de representante legal
  await page.$eval('input[name="hasLegalRepresentative"]', (el) => {
    if (el.checked) {
      el.checked = false
      el.dispatchEvent(new Event('change', { bubbles: true }))
    }
  })

  // 2. clica em confirmar busca de beneficio
  await page.evaluate(() => {
    const botoes = [...document.querySelectorAll('button')].filter(
      (b) => b.textContent.trim() === 'Confirmar' && !b.disabled,
    )
    if (botoes.length > 0) {
      botoes[botoes.length - 1].click()
    }
  })
}

async function consultar(dados) {
  const inicio = Date.now()
  const browser = await puppeteer.launch({
    headless: HEADLESS,
  })

  try {
    //abre a guia na aba de consultas
    const page = await browser.newPage()

    //valida a sessao e redireciona para consultas apos obter o token
    if (!(await validaSession(page))) {
      await userLogin(page)
      await page.goto(URL_CONSULTA)
    } else {
      console.log('sessao reativada')
    }

    await fillConsultationForm(page, dados)

    //espera o retorno da consulta
    const response = await page.waitForResponse(
      (res) =>
        res.url().includes('/query-inss-balances/finder/await') &&
        res.request().method() === 'POST' &&
        res.status() === 200,
      { timeout: 90000 },
    )

    const data = await response.json()
    const executionTimeMs = Date.now() - inicio
    return { success: true, data, executionTimeMs }
  } catch (erro) {
    const statusCode = erro.name === 'TimeoutError' ? 422 : 500
    const executionTimeMs = Date.now() - inicio
    return { success: false, error: erro.message, statusCode, executionTimeMs }
  } finally {
    await browser.close()
  }
}

module.exports = { consultar }
