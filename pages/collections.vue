<template>
  <v-container class="py-8">
    <!-- Header Section -->
    <div class="text-center mb-10">
      <h1 class="display-1 font-weight-bold mb-3">คอลเลกชัน NFT ของฉัน</h1>
      <p class="subtitle-1 grey--text">
        สำรวจคอลเลกชัน NFT ยอดนิยมและมูลค่าสูงสุดของคุณ
      </p>
    </div>

    <!-- Loading State -->
    <v-row v-if="isLoading" justify="center" class="my-12">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4 text-h6 grey--text">กำลังโหลดข้อมูล NFT...</p>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-alert v-if="error && !isLoading" type="error" dismissible @input="error = null" class="mb-4">
      {{ error }}
    </v-alert>

    <!-- Content (แสดงเมื่อโหลดเสร็จแล้ว) -->
    <template v-if="!isLoading">
      <!-- Filter & Sort Section -->
      <v-card class="mb-8 pa-4" outlined>
        <v-row align="center">
          <v-col cols="12" md="4">
            <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="ค้นหาคอลเลกชัน" outlined dense
              hide-details clearable></v-text-field>
          </v-col>

          <v-col cols="12" md="3">
            <v-select v-model="filterCategory" :items="categories" label="หมวดหมู่" outlined dense hide-details
              item-text="text" item-value="value"></v-select>
          </v-col>

          <v-col cols="12" md="3">
            <v-select v-model="sortBy" :items="sortOptions" label="เรียงตาม" outlined dense hide-details
              item-text="text" item-value="value"></v-select>
          </v-col>

          <v-col cols="12" md="2">
            <v-btn color="primary" block @click="fetchNFTs" :loading="isRefreshing">
              <v-icon left>mdi-refresh</v-icon>
              รีเฟรช
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <!-- Collections Grid -->
      <v-row v-if="filteredCollections.length > 0">
        <v-col v-for="(collection, index) in filteredCollections" :key="collection.tokenId" cols="12" sm="6" md="4"
          lg="3">
          <v-card class="collection-card" hover @click="goToCollection(collection.tokenId)">
            <!-- NFT Image -->
            <div class="collection-banner">
              <v-img :src="collection.thumbnail ||
                'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=400'
                " height="200" cover>
                <template v-slot:placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  </v-row>
                </template>
              </v-img>
            </div>

            <v-card-text class="pt-4 pb-4">
              <!-- Collection Name -->
              <div class="d-flex align-center mb-2">
                <h3 class="text-h6 font-weight-bold text-truncate flex-grow-1">
                  {{ collection.name || "ไม่มีชื่อ" }}
                </h3>
                <v-chip small :color="getSaleTypeColor(collection.sale_type)" class="ml-2">
                  {{ getSaleTypeText(collection.sale_type) }}
                </v-chip>
              </div>

              <!-- Description -->
              <p class="text-caption grey--text mb-3 text-truncate-2">
                {{ collection.description || "ไม่มีคำอธิบาย" }}
              </p>

              <!-- Stats -->
              <v-row dense class="mb-2">
                <v-col cols="6">
                  <div class="text-caption grey--text">Token ID</div>
                  <div class="text-body-2 font-weight-bold">
                    #{{ collection.tokenId }}
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption grey--text">ราคา</div>
                  <div class="text-body-2 font-weight-bold primary--text">
                    <v-icon small color="primary">mdi-ethereum</v-icon>
                    {{ collection.price || "0" }}
                    {{ getTokenSymbol(collection.blockchain) }}
                  </div>
                </v-col>
              </v-row>

              <v-row dense>
                <v-col cols="6">
                  <div class="text-caption grey--text">Blockchain</div>
                  <div class="text-body-2">
                    {{ collection.blockchain || "-" }}
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption grey--text">หมวดหมู่</div>
                  <div class="text-body-2">
                    {{ collection.category || "-" }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>

            <!-- Rank Badge -->
            <v-chip v-if="index < 3" :color="getRankColor(index)" small class="rank-badge">
              <v-icon left small>mdi-trophy</v-icon>
              #{{ index + 1 }}
            </v-chip>
          </v-card>
        </v-col>
      </v-row>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-state-content">
          <div class="empty-icon mb-6">
            <v-img src="https://images.unsplash.com/photo-1573865526739-10c1dd3aa370?w=300" max-width="200"
              class="mx-auto" style="opacity: 0.6"></v-img>
          </div>

          <h2 class="text-h4 font-weight-bold mb-3">ไม่พบ NFT</h2>

          <p class="text-subtitle-1 grey--text mb-6">
            คุณยังไม่มี NFT ในกระเป๋านี้ หรือลองเปลี่ยน Filter
          </p>

          <v-btn large color="primary" rounded @click="goToCreate" class="px-8">
            สร้าง NFT ใหม่
          </v-btn>
        </div>
      </div>

      <!-- Load More Button -->
      <v-row v-if="filteredCollections.length > 0 && hasMoreData">
        <v-col cols="12" class="text-center mt-6">
          <v-btn large outlined color="primary" @click="loadMore" :loading="loadingMore">
            <v-icon left>mdi-reload</v-icon>
            โหลดเพิ่มเติม
          </v-btn>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";

const API_BASE = process.env.BACKEND_URL;
export default {
  name: "CollectionsPage",

  data() {
    return {
      search: "",
      filterCategory: "All",
      sortBy: "latest",
      displayCount: 8,
      isLoading: false,
      isRefreshing: false,
      loadingMore: false,
      error: null,

      allCollections: [],

      categories: [
        { text: "ทั้งหมด", value: "All" },
        { text: "งานศิลปะ", value: "Art" },
        { text: "เกม", value: "Game" },
        { text: "รูปภาพ", value: "Photo" },
        { text: "อวตาร", value: "Avatar" },
      ],

      sortOptions: [
        { text: "ล่าสุด", value: "latest" },
        { text: "ราคา: ต่ำ-สูง", value: "priceAsc" },
        { text: "ราคา: สูง-ต่ำ", value: "priceDesc" },
      ],
    };
  },

  computed: {
    // ✅ ใช้ getter เดียวกับหน้า Create
    ...mapGetters("wallet", ["isConnected"]),

    // ✅ หาที่อยู่กระเป๋าจาก state (รองรับทั้ง account / address / getter)
    account() {
      return (
        this.$store.state.wallet?.account ||
        this.$store.state.wallet?.address ||
        this.$store.getters["wallet/account"] || // เผื่อมี getter ชื่อ account
        ""
      );
    },

    filteredCollections() {
      let result = [...this.allCollections];

      if (this.search) {
        const key = this.search.toLowerCase();
        result = result.filter(
          (c) =>
            (c.name && c.name.toLowerCase().includes(key)) ||
            (c.description && c.description.toLowerCase().includes(key))
        );
      }

      if (this.filterCategory !== "All") {
        result = result.filter((c) => c.category === this.filterCategory);
      }

      result.sort((a, b) => {
        switch (this.sortBy) {
          case "latest":
            return parseInt(b.tokenId) - parseInt(a.tokenId);
          case "priceAsc":
            return parseFloat(a.price || 0) - parseFloat(b.price || 0);
          case "priceDesc":
            return parseFloat(b.price || 0) - parseFloat(a.price || 0);
          case "popular":
            return parseInt(b.tokenId) - parseInt(a.tokenId);
          default:
            return 0;
        }
      });

      return result.slice(0, this.displayCount);
    },

    hasMoreData() {
      let result = [...this.allCollections];

      if (this.search) {
        const key = this.search.toLowerCase();
        result = result.filter(
          (c) =>
            (c.name && c.name.toLowerCase().includes(key)) ||
            (c.description && c.description.toLowerCase().includes(key))
        );
      }

      if (this.filterCategory !== "All") {
        result = result.filter((c) => c.category === this.filterCategory);
      }

      return this.displayCount < result.length;
    },
  },

  async mounted() {
    console.log(
      "Collections mounted -> isConnected:",
      this.isConnected,
      "account:",
      this.account
    );

    if (!this.isConnected) {
      this.$nuxt.$emit("showNotification", {
        text: "กรุณาเชื่อมต่อกระเป๋า MetaMask ก่อนเข้าคอลเลกชัน",
        color: "warning",
      });
      this.$router.push("/");
      return;
    }

    await this.fetchNFTs();
  },

  methods: {
    async fetchNFTs() {
      console.log("fetchNFTs() account =", this.account);

      if (!this.account) {
        this.error = "ไม่พบที่อยู่กระเป๋า กรุณาเชื่อมต่อ MetaMask ใหม่";
        return;
      }

      this.isLoading = this.allCollections.length === 0;
      this.isRefreshing = this.allCollections.length > 0;
      this.error = null;

      try {
        const res = await fetch(
          `${API_BASE}/api/nfts?owner=${this.account}`
        );
        if (!res.ok) {
          throw new Error("โหลดข้อมูล NFT ไม่สำเร็จ");
        }

        const nfts = await res.json();

        this.allCollections = nfts.map((nft) => ({
          ...nft,
          category: nft.category || "-",
        }));
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        this.error = err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล NFT";
        this.$nuxt.$emit("showNotification", {
          text: this.error,
          color: "error",
        });
      } finally {
        this.isLoading = false;
        this.isRefreshing = false;
      }
    },

    goToCollection(tokenId) {
      this.$router.push(`/nft/${tokenId}`);
    },

    goToCreate() {
      this.$router.push("/create");
    },

    getRankColor(index) {
      const colors = ["#FFD700", "#C0C0C0", "#CD7F32"];
      return colors[index] || "grey";
    },

    getSaleTypeColor(saleType) {
      switch (saleType) {
        case "fixed":
          return "success";
        case "not-for-sale":
          return "grey";
        default:
          return "grey";
      }
    },

    getSaleTypeText(saleType) {
      switch (saleType) {
        case "fixed":
          return "ขาย";
        case "not-for-sale":
          return "ไม่ขาย";
        default:
          return "ไม่ระบุ";
      }
    },

    getTokenSymbol(blockchain) {
      const chain = (blockchain || "").toLowerCase();
      if (chain.includes("binance")) return "BNB";
      if (chain.includes("polygon")) return "MATIC";
      return "ETH";
    },

    loadMore() {
      this.loadingMore = true;
      setTimeout(() => {
        this.displayCount += 4;
        this.loadingMore = false;
      }, 500);
    },
  },

  watch: {
    search() {
      this.displayCount = 8;
    },
    filterCategory() {
      this.displayCount = 8;
    },
    sortBy() {
      this.displayCount = 8;
    },
    account(newVal, oldVal) {
      console.log("wallet account changed:", oldVal, "->", newVal);
      if (newVal && newVal !== oldVal) {
        this.fetchNFTs();
      }
    },
  },
};
</script>

<style scoped>
.collection-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.collection-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.collection-banner {
  position: relative;
}

.rank-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-weight: bold;
  z-index: 2;
}

/* Text truncate 2 lines */
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Empty State Styles */
.empty-state {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-state-content {
  text-align: center;
  max-width: 500px;
}

.empty-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}
</style>
