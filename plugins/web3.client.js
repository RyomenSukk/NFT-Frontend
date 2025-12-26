// plugins/web3.js
import Web3 from 'web3'
import detectEthereumProvider from '@metamask/detect-provider'

export default async ({ app, store }, inject) => {
  let web3 = null
  let provider = null

  const detectProvider = async () => {
    provider = await detectEthereumProvider()
    if (provider) {
      web3 = new Web3(provider)
      console.log('MetaMask detected!')
      return true
    } else {
      console.log('Please install MetaMask!')
      return false
    }
  }

  // ------------------ CONNECT ------------------
  const connectWallet = async () => {
    try {
      const hasProvider = await detectProvider()
      if (!hasProvider) {
        throw new Error('กรุณาติดตั้ง MetaMask')
      }

      // ขอนับใหม่ทุกครั้งที่ user กดปุ่ม
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        const chainId = await provider.request({
          method: 'eth_chainId'
        })

        const balance = await web3.eth.getBalance(accounts[0])
        const balanceInEth = web3.utils.fromWei(balance, 'ether')

        // sync เข้า Vuex
        store.dispatch('wallet/setConnection', {
          connected: true,
          address: accounts[0],
          chainId,
          balance: balanceInEth
        })

        if (process.client) {
          localStorage.setItem('walletConnected', 'true')
          localStorage.setItem('walletAddress', accounts[0])
        }

        return {
          success: true,
          address: accounts[0],
          chainId,
          balance: balanceInEth
        }
      }

      return { success: false, error: 'ไม่พบบัญชีใน MetaMask' }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      return { success: false, error: error.message }
    }
  }

  // ------------------ SIGN-IN WITH SIGNATURE ------------------
  // ฟังก์ชันนี้คือ "login" แบบที่อยากได้
  const loginWithSignature = async () => {
    // 1) ขอ connect ก่อน (อาจจะเด้ง popup หรือไม่ ขึ้นกับ MetaMask)
    const connectResult = await connectWallet()
    if (!connectResult.success) return connectResult

    try {
      const address = connectResult.address

      // ปกติ nonce ควรมาจาก backend (เพื่อกัน replay)
      // ตอนนี้ใช้ตัวอย่างง่าย ๆ ไปก่อน
      const nonce = `login-${Date.now()}`
      const message = `
NFT Marketplace Login

Wallet: ${address}
Nonce: ${nonce}
      `.trim()

      // 2) ขอ Signature (ตัวนี้จะเด้ง popup "Signature request" ทุกครั้ง)
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, address]
      })

      // ตรงนี้จริง ๆ ควรส่ง { address, nonce, signature } ไป backend ตรวจ
      // แต่ถ้ายังไม่มี backend ก็เก็บไว้ใน frontend ได้ก่อน
      return {
        success: true,
        address,
        chainId: connectResult.chainId,
        balance: connectResult.balance,
        nonce,
        signature
      }
    } catch (error) {
      console.error('Error signing login message:', error)
      return { success: false, error: error.message }
    }
  }

  // ------------------ DISCONNECT ------------------
  const disconnectWallet = async () => {
    try {
      console.log('Disconnecting wallet...')

      await store.dispatch('wallet/disconnect')

      if (process.client) {
        localStorage.removeItem('walletConnected')
        localStorage.removeItem('walletAddress')
      }

      if (provider && provider.removeAllListeners) {
        provider.removeAllListeners('accountsChanged')
        provider.removeAllListeners('chainChanged')
      }

      web3 = null
      console.log('Wallet disconnected successfully')
      return true
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
      return false
    }
  }

  // ------------------ CHECK CONNECTION (จำสถานะเฉพาะตอน user ยังไม่กด logout) ------------------
  const checkConnection = async () => {
    try {
      if (process.client && !localStorage.getItem('walletConnected')) {
        return false
      }

      const hasProvider = await detectProvider()
      if (!hasProvider) return false

      const accounts = await web3.eth.getAccounts()
      if (accounts.length > 0) {
        const balance = await web3.eth.getBalance(accounts[0])
        const balanceInEth = web3.utils.fromWei(balance, 'ether')
        const chainId = await provider.request({ method: 'eth_chainId' })

        store.dispatch('wallet/setConnection', {
          connected: true,
          address: accounts[0],
          chainId,
          balance: balanceInEth
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Error checking connection:', error)
      return false
    }
  }

  // init provider & listeners
  await detectProvider()

  if (provider) {
    provider.on('accountsChanged', async (accounts) => {
      if (accounts.length > 0) {
        if (process.client && localStorage.getItem('walletConnected')) {
          const balance = await web3.eth.getBalance(accounts[0])
          const balanceInEth = web3.utils.fromWei(balance, 'ether')
          store.dispatch('wallet/updateAccount', {
            address: accounts[0],
            balance: balanceInEth
          })
        }
      } else {
        await disconnectWallet()
      }
    })

    provider.on('chainChanged', () => {
      window.location.reload()
    })
  }

  inject('web3', {
    instance: web3,
    provider,
    connectWallet,
    loginWithSignature,   // 👈 เพิ่มตัวนี้
    disconnectWallet,
    checkConnection,
    utils: web3 ? web3.utils : null
  })
}
