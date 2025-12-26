<template>
  <div>
    <!-- Hero Section -->
    <v-parallax
      dark
      src="https://cdn.pixabay.com/photo/2022/03/01/02/51/galaxy-7040416_1280.png"
      height="600"
    >
      <v-row align="center" justify="center">
        <v-col class="text-center" cols="12">
          <h1 class="display-2 font-weight-bold mb-4">
            NFT Marketplace
          </h1>
          <h4 class="subheading font-weight-regular">
            ซื้อ ขาย และสร้างสรรค์ NFT บน Blockchain
          </h4>
          <div class="mt-6">
            <v-btn
              x-large
              color="primary"
              rounded
              class="mr-4"
              to="/marketplace"
              nuxt
            >
              <v-icon left>mdi-rocket-launch</v-icon>
              สำรวจ NFT
            </v-btn>
            <v-btn
              x-large
              outlined
              color="white"
              rounded
              to="/create"
              nuxt
            >
              <v-icon left>mdi-palette</v-icon>
              สร้าง NFT
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-parallax>

    <!-- Categories -->
    <v-container class="my-10">
      <div class="text-center mb-8">
        <h2 class="display-1 font-weight-bold mb-3">หมวดหมู่</h2>
        <p class="subtitle-1 grey--text">
          สำรวจ NFT ตามหมวดหมู่ที่คุณสนใจ
        </p>
      </div>
      
      <v-row justify="center">
        <v-col
          v-for="category in categories"
          :key="category.name"
          cols="6"
          sm="4"
          md="3"
          lg="2"
        >
          <v-card
            class="text-center pa-6 category-card"
            @click="goToCategory(category.name)"
            outlined
            elevation="2"
          >
            <v-avatar
              size="80"
              :color="category.color"
              class="mb-3"
            >
              <v-icon large color="white">
                {{ category.icon }}
              </v-icon>
            </v-avatar>
            <p class="font-weight-bold text-h6 mb-0">{{ category.name }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- How It Works -->
    <v-container fluid class="grey lighten-5 py-10">
      <v-container>
        <div class="text-center mb-8">
          <h2 class="display-1 font-weight-bold mb-3">วิธีการใช้งาน</h2>
          <p class="subtitle-1 grey--text">
            เริ่มต้นใช้งาน NFT Marketplace ง่ายๆ ใน 4 ขั้นตอน
          </p>
        </div>
        
        <v-row>
          <v-col
            v-for="(step, index) in steps"
            :key="index"
            cols="12"
            sm="6"
            md="3"
          >
            <v-card class="text-center pa-5" flat color="transparent">
              <v-avatar
                size="80"
                :color="step.color"
                class="mb-4"
              >
                <v-icon large dark>{{ step.icon }}</v-icon>
              </v-avatar>
              <h3 class="title font-weight-bold mb-2">
                {{ index + 1 }}. {{ step.title }}
              </h3>
              <p class="grey--text">{{ step.description }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-container>

    <!-- CTA Section -->
    <v-container fluid class="primary py-10">
      <v-container>
        <v-row align="center" justify="center">
          <v-col cols="12" md="8" class="text-center white--text">
            <h2 class="display-1 font-weight-bold mb-4">
              พร้อมที่จะเริ่มต้นหรือยัง?
            </h2>
            <p class="subtitle-1 mb-6">
              เข้าร่วมชุมชนศิลปินและนักสะสมบน NFT Marketplace วันนี้
            </p>
            <v-btn
              x-large
              color="white"
              class="primary--text"
              rounded
              to="/marketplace"
              nuxt
            >
              เริ่มต้นเลย
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'HomePage',
  
  data() {
    return {
      steps: [
        {
          icon: 'mdi-wallet',
          title: 'เชื่อมต่อ Wallet',
          description: 'เชื่อมต่อ MetaMask wallet ของคุณ',
          color: 'primary'
        },
        {
          icon: 'mdi-magnify',
          title: 'สำรวจ NFT',
          description: 'เลือกดู NFT ที่คุณสนใจ',
          color: 'secondary'
        },
        {
          icon: 'mdi-cart',
          title: 'ซื้อ NFT',
          description: 'ซื้อ NFT ได้ทันที',
          color: 'accent'
        },
        {
          icon: 'mdi-folder-multiple',
          title: 'จัดการคอลเลกชัน',
          description: 'จัดการ NFT ในคอลเลกชันของคุณ',
          color: 'success'
        }
      ],
      categories: [
        { name: 'งานศิลปะ', icon: 'mdi-palette', color: 'primary'},
        { name: 'เกม', icon: 'mdi-gamepad-variant', color: 'success' },
        { name: 'รูปภาพ', icon: 'mdi-camera', color: 'info' },
        { name: 'อวตาร', icon: 'mdi-account-circle', color: 'warning' }
      ]
    }
  },
  
  computed: {
    ...mapGetters(['featuredNFTs'])
  },
  
  async mounted() {
    // Fetch NFTs when component mounts
    await this.fetchNFTs()
  },
  
  methods: {
    ...mapActions(['fetchNFTs']),
    
    goToCategory(category) {
      this.$router.push({
        path: '/marketplace',
        query: { category }
      })
    }
  }
}
</script>

<style scoped>
.category-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 16px;
  height: 100%;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.category-card:hover .v-avatar {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}
</style>