export const state = () => ({
  nfts: [],
  collections: [],
  loading: false,
  searchQuery: '',
  selectedCategory: 'ทั้งหมด',
  sortBy: 'ล่าสุด'
})

export const getters = {
  allNFTs: state => state.nfts,
  featuredNFTs: state => state.nfts.filter(nft => nft.featured),
  userNFTs: (state, getters, rootState) => {
    if (!rootState.wallet.address) return []
    return state.nfts.filter(nft => 
      nft.owner?.toLowerCase() === rootState.wallet.address.toLowerCase()
    )
  }
}

export const mutations = {
  SET_NFTS(state, nfts) {
    state.nfts = nfts
  },
  
  ADD_NFT(state, nft) {
    state.nfts.push(nft)
  },
  
  UPDATE_NFT(state, { id, updates }) {
    const index = state.nfts.findIndex(nft => nft.id === id)
    if (index !== -1) {
      state.nfts[index] = { ...state.nfts[index], ...updates }
    }
  },
  
  SET_COLLECTIONS(state, collections) {
    state.collections = collections
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_SEARCH_QUERY(state, query) {
    state.searchQuery = query
  },
  
  SET_CATEGORY(state, category) {
    state.selectedCategory = category
  },
  
  SET_SORT(state, sortBy) {
    state.sortBy = sortBy
  }
}

export const actions = {
  async fetchNFTs({ commit }) {
    commit('SET_LOADING', true)
    try {
      // Simulated NFT data - ในจริงจะเรียกจาก Smart Contract
      const mockNFTs = [
        {
          id: 1,
          name: 'Cosmic Ape #001',
          description: 'Rare cosmic ape from the metaverse',
          image: 'https://via.placeholder.com/400x400/6B46C1/FFFFFF?text=Cosmic+Ape',
          price: '0.5',
          owner: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          creator: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          category: 'Art',
          featured: true,
          likes: 125
        },
        {
          id: 2,
          name: 'Digital Landscape #023',
          description: 'Beautiful digital landscape art',
          image: 'https://via.placeholder.com/400x400/9333EA/FFFFFF?text=Digital+Art',
          price: '0.3',
          owner: '0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed',
          creator: '0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed',
          category: 'Art',
          featured: true,
          likes: 89
        },
        {
          id: 3,
          name: 'Cyber Punk Avatar',
          description: 'Unique cyberpunk style avatar',
          image: 'https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=Cyber+Punk',
          price: '1.2',
          owner: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
          creator: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
          category: 'Avatar',
          featured: false,
          likes: 245
        },
        {
          id: 4,
          name: 'Abstract Motion #007',
          description: 'Dynamic abstract motion art',
          image: 'https://via.placeholder.com/400x400/10B981/FFFFFF?text=Abstract',
          price: '0.8',
          owner: '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
          creator: '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
          category: 'Art',
          featured: false,
          likes: 67
        },
        {
          id: 5,
          name: 'Virtual Land #A42',
          description: 'Prime virtual real estate in the metaverse',
          image: 'https://via.placeholder.com/400x400/3B82F6/FFFFFF?text=Virtual+Land',
          price: '5.0',
          owner: '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
          creator: '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
          category: 'Virtual Land',
          featured: true,
          likes: 512
        },
        {
          id: 6,
          name: 'Music NFT - Beat Drop',
          description: 'Exclusive music NFT with full rights',
          image: 'https://via.placeholder.com/400x400/EF4444/FFFFFF?text=Music+NFT',
          price: '0.2',
          owner: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          creator: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          category: 'Music',
          featured: false,
          likes: 198
        }
      ]
      
      commit('SET_NFTS', mockNFTs)
    } catch (error) {
      console.error('Error fetching NFTs:', error)
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async createNFT({ commit, rootState }, nftData) {
    // ในจริงจะเรียก Smart Contract เพื่อ mint NFT
    const newNFT = {
      ...nftData,
      id: Date.now(),
      owner: rootState.wallet.address,
      creator: rootState.wallet.address,
      createdAt: new Date().toISOString()
    }
    commit('ADD_NFT', newNFT)
    return newNFT
  },
  
  async buyNFT({ commit, rootState }, { nftId, price }) {
    // ในจริงจะเรียก Smart Contract เพื่อซื้อ NFT
    commit('UPDATE_NFT', {
      id: nftId,
      updates: {
        owner: rootState.wallet.address,
        previousOwners: [] // เพิ่ม previous owners
      }
    })
  }
}
