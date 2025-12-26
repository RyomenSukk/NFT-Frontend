export const state = () => ({
  connected: false,
  address: null,
  chainId: null,
  balance: '0',
  loading: false,
  error: null
})

export const getters = {
  isConnected: state => state.connected,
  userAddress: state => state.address,
  shortAddress: state => {
    if (!state.address) return ''
    return `${state.address.slice(0, 6)}...${state.address.slice(-4)}`
  },
  userBalance: state => state.balance,
  currentChain: state => {
    const chains = {
      '0x1': 'Ethereum Mainnet',
      '0x38': 'BSC Mainnet',
      '0x61': 'BSC Testnet',
      '0xaa36a7': 'Ethereum Sepolia Testnet'
    }
    return chains[state.chainId] || 'Unknown Network'
  }
}

export const mutations = {
  SET_CONNECTION(state, { connected, address, chainId, balance }) {
    state.connected = connected
    state.address = address
    state.chainId = chainId
    state.balance = balance
    state.error = null
  },
  
  UPDATE_ACCOUNT(state, { address, balance }) {
    state.address = address
    state.balance = balance
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_ERROR(state, error) {
    state.error = error
    state.loading = false
  },
  
  DISCONNECT(state) {
    state.connected = false
    state.address = null
    state.chainId = null
    state.balance = '0'
    state.error = null
  }
}

export const actions = {
  setConnection({ commit }, connectionData) {
    commit('SET_CONNECTION', connectionData)
  },
  
  updateAccount({ commit }, accountData) {
    commit('UPDATE_ACCOUNT', accountData)
  },
  
  disconnect({ commit }) {
    commit('DISCONNECT')
  },
  
  setLoading({ commit }, loading) {
    commit('SET_LOADING', loading)
  },
  
  setError({ commit }, error) {
    commit('SET_ERROR', error)
  }
}
