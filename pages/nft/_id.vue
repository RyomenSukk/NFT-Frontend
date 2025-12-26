<template>
  <v-container class="mt-5">
    <v-row justify="center">
      <v-col cols="12" lg="10">
        <!-- Loading State -->
        <v-card v-if="loading" class="pa-6 text-center" elevation="0">
          <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
          <p class="text-h6">กำลังโหลดข้อมูล NFT...</p>
        </v-card>

        <!-- Error State -->
        <v-alert v-else-if="error" type="error" prominent class="mb-4" elevation="2">
          <v-row align="center">
            <v-col class="grow">
              <div class="title">ไม่พบข้อมูล NFT</div>
              <div>{{ errorMessage }}</div>
            </v-col>
            <v-col class="shrink">
              <v-btn color="white" outlined @click="$router.push('/')">
                กลับหน้าแรก
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>

        <!-- NFT Content -->
        <div v-else>
          <!-- Header with back button -->
          <div class="d-flex align-center mb-6">
            <v-btn icon large @click="$router.back()" class="mr-3 back-btn">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <div>
              <h1 class="display-1 mb-1">{{ nft.name || `NFT #${tokenId}` }}</h1>
              <div class="d-flex align-center">
                <v-chip small class="mr-2" color="primary" outlined>
                  <v-icon small left>mdi-pound</v-icon>
                  {{ tokenId }}
                </v-chip>
                <v-chip v-if="nft.category" small outlined>
                  {{ nft.category }}
                </v-chip>
              </div>
            </div>
          </div>

          <v-row>
            <!-- Left Column: Images/Media -->
            <v-col cols="12" md="6">
              <v-card outlined class="mb-4 image-card" elevation="4">
                <div v-if="nft.images && nft.images.length > 0">
                  <!-- Main Image Display -->
                  <v-img v-if="nft.images.length === 1" :src="nft.images[0]" max-height="500" contain
                    class="main-image">
                    <template v-slot:placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                      </v-row>
                    </template>
                  </v-img>

                  <!-- Multiple Images Carousel -->
                  <v-carousel v-else height="500" hide-delimiter-background show-arrows-on-hover cycle interval="5000">
                    <v-carousel-item v-for="(img, index) in nft.images" :key="index">
                      <v-img :src="img" height="500" contain class="main-image">
                        <template v-slot:placeholder>
                          <v-row class="fill-height ma-0" align="center" justify="center">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                          </v-row>
                        </template>
                      </v-img>
                    </v-carousel-item>
                  </v-carousel>

                  <!-- Thumbnails for multiple images -->
                  <v-card-text v-if="nft.images.length > 1" class="pa-3">
                    <v-row dense>
                      <v-col v-for="(img, index) in nft.images" :key="index" cols="3">
                        <v-img :src="img" height="80" class="thumbnail" contain></v-img>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </div>

                <!-- No Image Placeholder -->
                <div v-else class="pa-12 text-center no-image-placeholder">
                  <v-icon size="120" color="grey lighten-1">mdi-image-off</v-icon>
                  <p class="mt-4 text-h6 grey--text">ไม่มีรูปภาพ</p>
                </div>
              </v-card>

              <!-- External Link Card -->
              <v-card v-if="nft.external_url" outlined class="mb-4 link-card" elevation="2">
                <v-card-text>
                  <div class="d-flex align-center">
                    <v-avatar color="primary lighten-4" size="40" class="mr-3">
                      <v-icon color="primary">mdi-link-variant</v-icon>
                    </v-avatar>
                    <div class="flex-grow-1">
                      <div class="caption grey--text text--darken-1 mb-1">External Link</div>
                      <a :href="nft.external_url" target="_blank" rel="noopener noreferrer"
                        class="text-decoration-none primary--text font-weight-medium">
                        {{ nft.external_url }}
                        <v-icon small color="primary">mdi-open-in-new</v-icon>
                      </a>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Right Column: Details -->
            <v-col cols="12" md="6">
              <!-- Price & Sale Info Card -->
              <v-card class="mb-4 price-card" elevation="4">
                <v-card-title class="pb-2 primary--text">
                  <v-icon left color="primary">mdi-tag-multiple</v-icon>
                  ข้อมูลการขาย
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="pa-4">
                  <v-row>
                    <v-col cols="6">
                      <div class="caption grey--text text--darken-1 mb-2">ประเภทการขาย</div>
                      <v-chip :color="nft.sale_type === 'not-for-sale' ? 'grey' : 'success'" text-color="white"
                        class="font-weight-medium">
                        <v-icon small left>
                          {{ nft.sale_type === 'not-for-sale' ? 'mdi-close-circle' : 'mdi-check-circle' }}
                        </v-icon>
                        {{ saleTypeText }}
                      </v-chip>
                    </v-col>
                    <v-col cols="6">
                      <div class="caption grey--text text--darken-1 mb-2">ราคา</div>
                      <div v-if="nft.sale_type !== 'not-for-sale' && nft.price" class="d-flex align-center">
                        <v-icon color="primary" class="mr-2">mdi-ethereum</v-icon>
                        <span class="text-h5 font-weight-bold primary--text">
                          {{ nft.price }} {{ symbolByChain }}
                        </span>
                      </div>
                      <div v-else class="grey--text text-h6">-</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Description Card -->
              <v-card class="mb-4" elevation="2">
                <v-card-title class="pb-2">
                  <v-icon left>mdi-text-box</v-icon>
                  คำอธิบาย
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="pa-4">
                  <p v-if="nft.description" class="mb-0 body-1">
                    {{ nft.description }}
                  </p>
                  <p v-else class="mb-0 grey--text text--lighten-1 font-italic">
                    ไม่มีคำอธิบาย
                  </p>
                </v-card-text>
              </v-card>

              <!-- Details Card -->
              <v-card class="mb-4" elevation="2">
                <v-card-title class="pb-2">
                  <v-icon left>mdi-information-outline</v-icon>
                  รายละเอียด
                </v-card-title>
                <v-divider></v-divider>
                <v-list>
                  <v-list-item>
                    <v-list-item-avatar color="primary lighten-4">
                      <v-icon color="primary">mdi-pound</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-subtitle>Token ID</v-list-item-subtitle>
                      <v-list-item-title class="font-weight-bold">
                        #{{ tokenId }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-divider v-if="nft.category" inset></v-divider>
                  <v-list-item v-if="nft.category">
                    <v-list-item-avatar color="success lighten-4">
                      <v-icon color="success">mdi-shape</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-subtitle>หมวดหมู่</v-list-item-subtitle>
                      <v-list-item-title>
                        <v-chip small color="success" outlined>{{ nft.category }}</v-chip>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-divider v-if="nft.blockchain" inset></v-divider>
                  <v-list-item v-if="nft.blockchain">
                    <v-list-item-avatar :color="blockchainColor + '20'">
                      <v-icon :color="blockchainColor">
                        {{ blockchainIcon }}
                      </v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-subtitle>Blockchain</v-list-item-subtitle>
                      <v-list-item-title class="font-weight-medium">
                        {{ nft.blockchain }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-divider v-if="nft.createdAt" inset></v-divider>
                  <v-list-item v-if="nft.createdAt">
                    <v-list-item-avatar color="info lighten-4">
                      <v-icon color="info">mdi-calendar</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-subtitle>วันที่สร้าง</v-list-item-subtitle>
                      <v-list-item-title>
                        {{ formatDate(nft.createdAt) }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>

              <!-- Owner Card -->
              <v-card v-if="nft.owner" class="mb-4 owner-card" elevation="2">
                <v-card-title class="pb-2">
                  <v-icon left>mdi-account-circle</v-icon>
                  เจ้าของ
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="pa-4">
                  <div class="d-flex align-center">
                    <v-avatar color="primary" size="48" class="mr-3 elevation-2">
                      <v-icon dark>mdi-account</v-icon>
                    </v-avatar>
                    <div class="mb-8">
                      <div class="caption grey--text text--darken-1 mb-1">Wallet Address</div>
                      <div class="d-flex align-center">
                        <code class="text-body-2 font-weight-medium">{{ nft.owner }}</code>
                      </div>
                    </div>
                  </div>
                  <v-btn block outlined color="primary" :href="explorerUrl" target="_blank">
                    <v-icon left>mdi-open-in-new</v-icon>
                    ดูบน Etherscan
                  </v-btn>
                </v-card-text>
              </v-card>


              <!-- Action Buttons -->
              <v-card v-if="canBuy || isOwner" class="action-card" elevation="4">
                <v-card-text class="pa-4">
                  <v-btn v-if="canBuy" block x-large color="primary" @click="buyDialog = true" :loading="buying"
                    class="mb-3 font-weight-bold" elevation="2">
                    <v-icon left>mdi-cart</v-icon>
                    ซื้อ NFT นี้
                  </v-btn>
                  <BuyNftDialog v-model="buyDialog" :nft="nft" :symbol="symbolByChain" :loading="buying"
                    @confirm="buyNFT" />

                  <div v-if="isOwner">
                    <v-alert dense outlined color="success" class="mb-3">
                      <div class="d-flex align-center">
                        <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
                        <span class="font-weight-medium">คุณเป็นเจ้าของ NFT นี้</span>
                      </div>
                    </v-alert>

                    <v-btn block color="primary" @click="openSellDialog" class="mb-2" elevation="2">
                      <v-icon left>mdi-tag</v-icon>
                      ตั้งขาย / แก้ไขการขาย
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-col>
    </v-row>

    <!-- Sell / Listing Dialog -->
    <v-dialog v-model="sellDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="headline primary white--text">
          <v-icon left color="white">mdi-tag</v-icon>
          จัดการการขาย NFT
        </v-card-title>

        <v-card-text class="pt-6">
          <v-switch v-model="sellForm.forSale" label="ต้องการตั้งขาย NFT นี้" inset color="primary"
            class="mb-4"></v-switch>

          <v-text-field v-model="sellForm.price" label="ราคา (ETH)" type="number" :disabled="!sellForm.forSale"
            prepend-inner-icon="mdi-ethereum" outlined dense hide-details="auto"
            :color="sellForm.forSale ? 'primary' : ''"></v-text-field>

          <v-alert dense text color="info" class="mt-4 mb-0">
            <small>
              ตอนนี้ระบบรองรับการขายแบบ <strong>ราคาคงที่ (Fixed price)</strong> เท่านั้น
            </small>
          </v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn text @click="sellDialog = false" :disabled="selling">
            ยกเลิก
          </v-btn>
          <v-btn color="primary" :loading="selling" @click="submitSell" elevation="2">
            <v-icon left>mdi-content-save</v-icon>
            บันทึก
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000" elevation="6">
      <v-icon left color="white">
        {{ snackbarColor === 'success' ? 'mdi-check-circle' :
          snackbarColor === 'error' ? 'mdi-alert-circle' : 'mdi-information' }}
      </v-icon>
      {{ snackbarText }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false" color="white">
          ปิด
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import BuyNftDialog from "@/components/BuyNftDialog.vue";

const API_BASE = process.env.BACKEND_URL || "http://localhost:4000";
export default {
  name: "NftDetailPage",
  components: {
    BuyNftDialog
  },
  data() {
    return {
      tokenId: null,
      nft: {},
      loading: true,
      error: false,
      errorMessage: "",
      buying: false,

      buyDialog: false,

      sellDialog: false,
      sellForm: {
        forSale: false,
        price: "",
      },
      selling: false,

      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",
      isDevelopment: process.env.NODE_ENV === "development",
    };
  },

  computed: {
    ...mapGetters("wallet", ["isConnected"]),

    explorerUrl() {
      const tokenId = this.nft.tokenId || this.nft.id
      return `https://sepolia.etherscan.io/nft/0x38B774d15420AAc353946A2845039644681f75B1/${tokenId}`
    },

    saleTypeText() {
      const t = this.nft.sale_type;
      if (t === "fixed" || t === 1 || t === "1") return "ราคาคงที่";
      if (t === "not-for-sale" || t === 0 || t === "0") return "ไม่ขาย";
      return t || "-";
    },

    symbolByChain() {
      const chain = (this.nft.blockchain || "").toLowerCase();
      if (chain.includes("binance")) return "BNB";
      if (chain.includes("polygon")) return "MATIC";
      return "ETH";
    },

    blockchainIcon() {
      const chain = (this.nft.blockchain || "").toLowerCase();
      if (chain.includes("binance")) return "mdi-alpha-b-circle";
      if (chain.includes("polygon")) return "mdi-triangle";
      return "mdi-ethereum";
    },

    blockchainColor() {
      const chain = (this.nft.blockchain || "").toLowerCase();
      if (chain.includes("binance")) return "#F3BA2F";
      if (chain.includes("polygon")) return "#8247E5";
      return "#627EEA";
    },

    canBuy() {
      return (
        this.nft.sale_type !== "not-for-sale" &&
        this.nft.price &&
        parseFloat(this.nft.price) > 0 &&
        !this.isOwner
      );
    },

    walletAddress() {
      return (
        this.$store?.state?.wallet?.account ||
        this.$store?.state?.wallet?.address ||
        ""
      ).toLowerCase();
    },

    isOwner() {
      const ownerAddress = (this.nft.owner || "").toLowerCase();
      return this.walletAddress && ownerAddress && this.walletAddress === ownerAddress;
    },
  },

  async mounted() {
    this.tokenId = this.$route.params.id;
    await this.loadNFT();
  },

  methods: {
    async loadNFT() {
      this.loading = true;
      this.error = false;

      try {
        const res = await fetch(`${API_BASE}/api/nfts/${this.tokenId}`);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "โหลดข้อมูล NFT ไม่สำเร็จ");
        }

        const data = await res.json();

        if (Array.isArray(data.images)) {
          data.images = data.images.map((img) =>
            img.startsWith("http") ? img : `${API_BASE}${img}`
          );
        }

        if (data.onchain) {
          if (data.onchain.owner) {
            data.owner = data.onchain.owner;
          }
          if (typeof data.onchain.price !== "undefined") {
            data.price = data.onchain.price;
          }
          if (typeof data.onchain.saleTypeLabel !== "undefined") {
            data.sale_type = data.onchain.saleTypeLabel;
          }
        }

        this.nft = data;
        console.log("NFT loaded:", data);
      } catch (e) {
        console.error("Error loading NFT:", e);
        this.error = true;
        this.errorMessage = e.message || "ไม่สามารถโหลดข้อมูล NFT ได้";
        this.nft = {};
      } finally {
        this.loading = false;
      }
    },

    openSellDialog() {
      const listed =
        (this.nft.onchain && this.nft.onchain.listed) ||
        (this.nft.sale_type && this.nft.sale_type !== "not-for-sale");

      this.sellForm.forSale = !!listed;
      this.sellForm.price =
        this.nft.price || (this.nft.onchain && this.nft.onchain.price) || "";

      this.sellDialog = true;
    },

    async submitSell() {
      if (!this.isConnected) {
        this.showSnackbar("กรุณาเชื่อมต่อ Wallet ก่อน", "warning");
        return;
      }

      const from = (
        this.$store?.state?.wallet?.account ||
        this.$store?.state?.wallet?.address ||
        ""
      ).toLowerCase();

      if (!from) {
        this.showSnackbar("ไม่พบที่อยู่กระเป๋าของคุณ", "error");
        return;
      }

      if (!window.ethereum) {
        this.showSnackbar("ไม่พบ MetaMask หรือ Ethereum provider", "error");
        return;
      }

      if (this.sellForm.forSale) {
        const p = parseFloat(this.sellForm.price);
        if (!p || p <= 0) {
          this.showSnackbar("กรุณากรอกราคาให้ถูกต้อง (> 0)", "warning");
          return;
        }
      }

      this.selling = true;

      try {
        const res = await fetch(
          `${API_BASE}/api/nfts/${this.tokenId}/list-tx`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ownerAddress: from,
              forSale: this.sellForm.forSale,
              price: this.sellForm.forSale ? this.sellForm.price : null,
            }),
          }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.success) {
          throw new Error(data.message || "เตรียมธุรกรรมตั้งขายไม่สำเร็จ");
        }

        const txParams = {
          from,
          to: data.to,
          data: data.data,
          value: data.value || "0x0",
        };

        const txHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [txParams],
        });

        if (this.sellForm.forSale) {
          this.showSnackbar(
            "ส่งธุรกรรมตั้งขายแล้ว กำลังรอการยืนยันบน blockchain...",
            "info"
          );
        } else {
          this.showSnackbar(
            "ส่งธุรกรรมยกเลิกรายการขายแล้ว กำลังรอการยืนยัน...",
            "info"
          );
        }

        console.log("list/delist txHash:", txHash);

        this.sellDialog = false;

        setTimeout(() => {
          this.loadNFT();
        }, 15000);
      } catch (err) {
        console.error("Error listing NFT:", err);
        this.showSnackbar(
          err.message || "เกิดข้อผิดพลาดในการตั้งขาย/ยกเลิกรายการขาย",
          "error"
        );
      } finally {
        this.selling = false;
      }
    },

    async buyNFT() {
      if (!this.isConnected) {
        this.showSnackbar("กรุณาเชื่อมต่อ Wallet ก่อน", "warning");
        return;
      }

      const from = this.walletAddress;
      if (!from) {
        this.showSnackbar("ไม่พบที่อยู่กระเป๋าของคุณ", "error");
        return;
      }

      if (!window.ethereum) {
        this.showSnackbar("ไม่พบ MetaMask หรือ Ethereum provider", "error");
        return;
      }

      this.buying = true;
      this.buyDialog = false;
      try {
        const res = await fetch(
          `${API_BASE}/api/nfts/${this.tokenId}/buy-tx`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ buyerAddress: from }),
          }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data.success) {
          throw new Error(data.message || "เตรียมธุรกรรมไม่สำเร็จ");
        }

        const txParams = {
          from,
          to: data.to,
          data: data.data,
          value: data.value,
        };

        const txHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [txParams],
        });

        this.showSnackbar("ส่งธุรกรรมแล้ว กำลังรอการยืนยัน...", "info");
        console.log("txHash:", txHash);

        setTimeout(() => {
          this.loadNFT();
        }, 15000);
      } catch (error) {
        console.error("Error buying NFT:", error);
        this.showSnackbar(error.message || "เกิดข้อผิดพลาดในการซื้อ NFT", "error");
      } finally {
        this.buying = false;
      }
    },

    shortenAddress(address) {
      if (!address) return "";
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },

    copyAddress(address) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(address);
        this.showSnackbar("คัดลอก Address แล้ว", "success");
      }
    },

    showSnackbar(text, color = "success") {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    },

    formatDate(dateString) {
      if (!dateString) return "-";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        return dateString;
      }
    },
  },
};
</script>

<style scoped>
.back-btn {
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateX(-4px);
}

.image-card {
  border-radius: 12px !important;
  overflow: hidden;
  transition: all 0.3s ease;
}

.image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.main-image {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.no-image-placeholder {
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  border-radius: 8px;
}

.thumbnail {
  cursor: pointer;
  border: 3px solid transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.thumbnail:hover {
  border-color: #1976d2;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.link-card {
  border-radius: 12px !important;
  transition: all 0.3s ease;
}

.link-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
}

.price-card {
  border-radius: 12px !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.price-card .v-card__title {
  color: white !important;
}

.price-card .v-card__text {
  background: white;
  border-radius: 0 0 12px 12px;
}

.owner-card {
  border-radius: 12px !important;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.owner-card:hover {
  border-color: #1976d2;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.2) !important;
}

.action-card {
  border-radius: 12px !important;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

code {
  background-color: #f5f5f5;
  padding: 6px 12px;
  border-radius: 6px;
  font-family: "Courier New", monospace;
  color: #1976d2;
  font-weight: 500;
  border: 1px solid #e0e0e0;
}

pre {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid #e0e0e0;
}

/* Animation for cards */
.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Smooth transitions for buttons */
.v-btn {
  transition: all 0.3s ease;
}

.v-btn:hover {
  transform: translateY(-2px);
}

/* Chip animations */
.v-chip {
  transition: all 0.3s ease;
}

.v-chip:hover {
  transform: scale(1.05);
}

/* Avatar pulse effect */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
}

.v-avatar {
  animation: pulse 2s infinite;
}

/* Loading animation enhancement */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.v-card {
  animation: fadeIn 0.5s ease-out;
}

/* Gradient text for headings */
.display-1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Enhanced snackbar */
.v-snackbar {
  border-radius: 8px !important;
}

/* Dialog enhancements */
.v-dialog>.v-card {
  border-radius: 16px !important;
  overflow: hidden;
}

/* List item hover effect */
.v-list-item {
  transition: all 0.3s ease;
}

.v-list-item:hover {
  background-color: rgba(25, 118, 210, 0.05);
  transform: translateX(4px);
}

/* Alert enhancement */
.v-alert {
  border-radius: 12px !important;
}

/* Carousel enhancements */
.v-carousel {
  border-radius: 12px 12px 0 0 !important;
}

/* Input field focus effect */
.v-text-field--outlined {
  transition: all 0.3s ease;
}

.v-text-field--outlined:focus-within {
  transform: scale(1.02);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>