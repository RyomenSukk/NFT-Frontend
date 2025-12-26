<template>
  <v-container class="mt-5">

    <!-- Alert for non-connected users -->
    <v-alert v-if="!isConnected" type="warning" prominent class="mb-5">
      <v-row align="center">
        <v-col class="grow">
          กรุณาเชื่อมต่อ MetaMask wallet ก่อนสร้าง NFT
        </v-col>
      </v-row>
    </v-alert>

    <!-- Page Title -->
    <v-row class="mb-5">
      <v-col cols="12">
        <h1 class="display-1 font-weight-bold">NFT Marketplace</h1>
        <p class="subtitle-1 grey--text">ค้นหาและซื้อ NFT ที่คุณชื่นชอบ</p>
      </v-col>
    </v-row>

    <!-- Filters and Search -->
    <v-row class="mb-5">
      <v-col cols="12" md="3">
        <v-select v-model="selectedCategory" :items="categories" label="หมวดหมู่" outlined dense
          prepend-inner-icon="mdi-filter" @change="filterNFTs"></v-select>
      </v-col>

      <v-col cols="12" md="3">
        <v-select v-model="sortBy" :items="sortOptions" label="เรียงตาม" outlined dense prepend-inner-icon="mdi-sort"
          @change="sortNFTs"></v-select>
      </v-col>

      <v-col cols="12" md="3">
        <v-text-field v-model="searchQuery" label="ค้นหา NFT" outlined dense prepend-inner-icon="mdi-magnify" clearable
          @input="searchNFTs"></v-text-field>
      </v-col>

      <v-col cols="12" md="3">
        <v-btn class="mx-1" outlined dense :color="isConnected ? 'primary' : 'grey'" :disabled="!isConnected"
          @click="handleCreateClick">
          <v-icon left>
            {{ isConnected ? 'mdi-plus-circle' : 'mdi-lock' }}
          </v-icon>
          สร้าง NFT
        </v-btn>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4">กำลังโหลด NFT...</p>
      </v-col>
    </v-row>

    <!-- NFT Grid -->
    <v-row v-else-if="displayedNFTs.length > 0">
      <v-col v-for="nft in displayedNFTs" :key="nft.id" cols="12" sm="6" md="4" lg="3">
        <nft-card :nft="nft" />
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else>
      <v-col cols="12">
        <v-card class="text-center pa-10">
          <v-icon size="64" color="grey">mdi-image-off</v-icon>
          <h3 class="mt-4">ไม่พบ NFT</h3>
          <p class="grey--text">ลองปรับเปลี่ยนตัวกรองหรือคำค้นหา</p>
          <v-btn class="mt-4" color="primary" @click="resetFilters">
            รีเซ็ตตัวกรอง
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Pagination -->
    <v-row v-if="totalPages > 1" class="mt-5">
      <v-col cols="12">
        <v-pagination v-model="currentPage" :length="totalPages" :total-visible="7" circle></v-pagination>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import NftCard from "@/components/NFTCard.vue";

const API_BASE = process.env.BACKEND_URL || "http://localhost:4000";
export default {
  name: "MarketplacePage",
  components: {
    NftCard,
  },
  data() {
    return {
      showFilters: false,
      searchQuery: "",
      selectedCategory: "ทั้งหมด",
      sortBy: "ล่าสุด",
      priceRange: [0, 10],
      verifiedOnly: false,
      hasOffers: false,
      currentPage: 1,
      itemsPerPage: 12,

      // ✅ loading / data มาเก็บใน component เอง
      loading: false,
      allNFTs: [],
      filteredNFTs: [],

      categories: ["ทั้งหมด", "งานศิลปะ", "เกม", "รูปภาพ", "อวตาร"],
      sortOptions: ["ล่าสุด", "ราคา: ต่ำ-สูง", "ราคา: สูง-ต่ำ"],
    };
  },

  computed: {
    ...mapGetters("wallet", ["isConnected"]),

    displayedNFTs() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredNFTs.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredNFTs.length / this.itemsPerPage) || 1;
    },
  },

  watch: {
    "$route.query.category": {
      immediate: true,
      handler(category) {
        if (category && this.categories.includes(category)) {
          this.selectedCategory = category;
          this.filterNFTs();
        }
      },
    },
  },

  async mounted() {
    await this.fetchMarketNFTs();
  },

  methods: {
    // ✅ ดึง NFT ที่กำลังขายอยู่ทั้งหมดจาก backend
    async fetchMarketNFTs() {
      this.loading = true;
      try {
        const res = await fetch(`${API_BASE}/api/market/listings`);
        if (!res.ok) {
          throw new Error("โหลดรายการ NFT ไม่สำเร็จ");
        }

        const items = await res.json();

        // map ให้เข้ากับโครงที่ marketplace + <nft-card> ใช้
        this.allNFTs = items.map((item, index) => ({
          // id เอาไว้ใช้ sort/ key
          id: Number(item.tokenId) || index + 1,
          tokenId: item.tokenId,

          name: item.name || "",
          description: item.description || "",
          category: item.category || "อื่นๆ",

          // รูปหลักที่ใช้แสดงบนการ์ด
          image: item.thumbnail || null,

          price: item.price || "0",
          saleType: item.sale_type || "",
          blockchain: item.blockchain || "",
          owner: item.owner || "",

          // ไว้ให้ sort “ยอดนิยม” ทำงาน (ตอนนี้ default 0)
          likes: item.likes || 0,
        }));

        this.filteredNFTs = [...this.allNFTs];
        this.filterNFTs(); // apply filter/ sort ตามค่าปัจจุบัน
      } catch (err) {
        console.error("Error fetchMarketNFTs:", err);
        this.$nuxt.$emit("showNotification", {
          text: err.message || "เกิดข้อผิดพลาดในการโหลด NFT",
          color: "error",
        });
      } finally {
        this.loading = false;
      }
    },

    handleCreateClick() {
      if (!this.isConnected) {
        this.$nuxt.$emit("showNotification", {
          text: "กรุณาเชื่อมต่อกระเป๋า MetaMask ก่อนสร้าง NFT",
          color: "warning",
        });
        return;
      }
      this.$router.push("/create");
    },

    filterNFTs() {
      let filtered = [...this.allNFTs];

      // Filter by category
      if (this.selectedCategory !== "ทั้งหมด") {
        filtered = filtered.filter(
          (nft) => nft.category === this.selectedCategory
        );
      }

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (nft) =>
            nft.name.toLowerCase().includes(query) ||
            (nft.description &&
              nft.description.toLowerCase().includes(query))
        );
      }

      // Filter by price range
      filtered = filtered.filter((nft) => {
        const price = parseFloat(nft.price || 0);
        return price >= this.priceRange[0] && price <= this.priceRange[1];
      });

      // Apply sorting
      this.sortNFTs(filtered);

      // Reset to first page when filtering
      this.currentPage = 1;
    },

    sortNFTs(nfts = null) {
      const toSort = nfts || [...this.filteredNFTs];

      switch (this.sortBy) {
        case "ราคา: ต่ำ-สูง":
          toSort.sort(
            (a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0)
          );
          break;
        case "ราคา: สูง-ต่ำ":
          toSort.sort(
            (a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0)
          );
          break;
        case "ยอดนิยม":
          toSort.sort((a, b) => (b.likes || 0) - (a.likes || 0));
          break;
        case "ล่าสุด":
        default:
          toSort.sort((a, b) => (b.id || 0) - (a.id || 0));
      }

      this.filteredNFTs = toSort;
    },

    searchNFTs() {
      this.filterNFTs();
    },

    applyFilters() {
      this.filterNFTs();
      this.showFilters = false;
    },

    resetFilters() {
      this.searchQuery = "";
      this.selectedCategory = "ทั้งหมด";
      this.sortBy = "ล่าสุด";
      this.priceRange = [0, 10];
      this.verifiedOnly = false;
      this.hasOffers = false;
      this.filteredNFTs = [...this.allNFTs];
      this.showFilters = false;
      this.currentPage = 1;
    },
  },
};
</script>

<style scoped>
/* Add any custom styles here */
</style>
