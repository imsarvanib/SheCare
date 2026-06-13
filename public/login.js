console.log('[LoginJS] Login JS running')

document.addEventListener('DOMContentLoaded', () => {
  console.log('[LoginJS] DOMContentLoaded event fired')

  // Select the login form
  const loginForm = document.querySelector('form')

  if (!loginForm) {
    console.warn('[LoginJS] Login form not found in DOM')
    return
  }

  console.log('[LoginJS] Login form found, attaching submit listener')

  // Add submit event listener
  loginForm.addEventListener('submit', async (event) => {
    // FIRST: prevent default form submission (page reload, GET request)
    event.preventDefault()
    console.log('LOGIN CLICKED')
    console.log('[LoginJS] Form submission prevented, POST request will be used instead')

    // Extract email and password from form inputs
    const emailInput = loginForm.querySelector('input[type="email"]')
    const passwordInput = loginForm.querySelector('input[type="password"]')

    if (!emailInput || !passwordInput) {
      console.error('[LoginJS] Email or password input not found')
      alert('Form inputs not found')
      return
    }

    const email = emailInput.value.trim()
    const password = passwordInput.value.trim()

    console.log('[LoginJS] Extracted credentials:', { email, passwordLength: password.length })

    if (!email || !password) {
      alert('Please enter email and password')
      return
    }

    try {
      console.log('Sending request to backend')
      console.log('[LoginJS] Sending POST request to http://10.10.10.230:5000/login')

      // Send POST request using fetch
      const response = await fetch('http://10.10.10.230:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('[LoginJS] Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('[LoginJS] Login response:', data)
        alert('Login successful')
      } else {
        console.log('[LoginJS] Login failed with status:', response.status)
        alert('Invalid credentials')
      }
    } catch (error) {
      console.error('[LoginJS] Fetch error:', error)
      alert('Unable to login right now. Please try again.')
    }
  })
})
