<template>
  <v-container class="mt-5">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h1 class="display-1 font-weight-bold mb-5">ลงขายสินค้า</h1>

        <v-card class="pa-6">
          <v-form ref="createForm" v-model="formValid" lazy-validation>
            <!-- File Upload -->
            <v-divider class="mb-6"></v-divider>

            <v-text-field v-model="formData.name" label="ชื่อ NFT *" outlined :rules="nameRules" counter="50"
              class="mb-4"></v-text-field>

            <div class="mb-6">
              <h3 class="mb-3">อัพโหลดไฟล์ *</h3>

              <v-file-input v-model="fileInput" label="เลือกไฟล์ (รูปภาพ, วิดีโอ, เสียง, 3D)" outlined
                accept="image/*,video/*,audio/*,.glb,.gltf" prepend-icon="mdi-camera" :rules="fileRules" show-size
                multiple @change="handleFileUpload">
                <template v-slot:selection="{ index }">
                  <span v-if="index === 0" class="grey--text text--darken-3">
                    เลือกแล้ว {{ formData.files.length }} ไฟล์
                  </span>
                </template>
              </v-file-input>

              <!-- Multi File Preview -->
              <div v-if="filePreviews.length" class="mt-3">
                <v-row>
                  <v-col v-for="(preview, index) in filePreviews" :key="index" cols="12" sm="6" md="4">
                    <v-card outlined>
                      <v-img v-if="preview.type === 'image'" :src="preview.src" max-height="200" contain></v-img>

                      <v-card-text class="py-2">
                        <div v-if="preview.type !== 'image'" class="mb-1 text-center">
                          <v-icon large>{{ getFileIcon(preview.type) }}</v-icon>
                        </div>

                        <div class="subtitle-2 text-truncate">
                          {{ preview.name }}
                        </div>
                      </v-card-text>

                      <v-card-actions class="justify-space-between">
                        <span class="caption grey--text">
                          {{ (preview.size / 1024).toFixed(1) }} KB
                        </span>
                        <v-btn icon color="error" @click="removeFile(index)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </div>

            <!-- NFT Details -->
            <h3 class="mb-3">รายละเอียด NFT</h3>

            <v-text-field v-model="formData.externalLink" label="ลิงค์ภายนอก" outlined
              placeholder="https://yoursite.com/item/123" prepend-inner-icon="mdi-link"
              hint="ลิงก์ไปยังเว็บไซต์ภายนอกที่เกี่ยวข้อง" persistent-hint class="mb-4"></v-text-field>

            <v-textarea v-model="formData.description" label="คำอธิบาย" outlined rows="4" counter="1000"
              hint="อธิบายรายละเอียดเกี่ยวกับ NFT ของคุณ" persistent-hint class="mb-4"></v-textarea>

            <v-select v-model="formData.category" :items="categories" label="หมวดหมู่ *" outlined :rules="categoryRules"
              class="mb-4"></v-select>

            <v-divider class="mb-6"></v-divider>

            <!-- Pricing -->
            <h3 class="mb-3">ราคาและการขาย</h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-select v-model="formData.saleType" :items="saleTypes" label="ประเภทการขาย" outlined
                  @change="handleSaleTypeChange"></v-select>
              </v-col>

              <v-col cols="12" md="6" v-if="formData.saleType !== 'not-for-sale'">
                <v-text-field v-model="formData.price" :label="`ราคา (${priceToken})`" outlined type="number"
                  step="0.001" :rules="formData.saleType !== 'not-for-sale' ? priceRules : []"
                  :prepend-inner-icon="priceIcon" hint="ระบบจะหักค่าคอมมิชชั่นประมาณ 10% จากราคานี้"
                  persistent-hint></v-text-field>

                <div v-if="netPrice" class="caption grey--text mt-1">
                  ระบบจะหักค่าคอมมิชชั่นประมาณ {{ commissionRate * 100 }}%
                  <br />
                  คุณจะได้รับสุทธิประมาณ
                  <span class="font-weight-bold">{{ netPrice }} {{ priceToken }}</span>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <v-select v-model="formData.blockchain" :items="blockchains" label="Blockchain" outlined
                  hint="เลือก Blockchain ที่ต้องการ" persistent-hint></v-select>
              </v-col>
            </v-row>

            <v-divider class="mb-6 mt-4"></v-divider>

            <!-- Action Buttons -->
            <div class="text-center mt-8">
              <v-btn large outlined class="mr-4" @click="resetForm">
                ล้างข้อมูล
              </v-btn>

              <v-btn large color="primary" :disabled="!formValid || creating" :loading="creating" @click="createNFT">
                <v-icon left>mdi-creation</v-icon>
                สร้าง NFT
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success Dialog -->
    <v-dialog v-model="successDialog" max-width="500">
      <v-card>
        <v-card-text class="text-center pa-6">
          <v-icon size="64" color="success" class="mb-4">
            mdi-check-circle
          </v-icon>
          <h2 class="mb-4">สร้าง NFT สำเร็จ!</h2>
          <p>NFT ของคุณได้ถูกสร้างและบันทึกบน Blockchain แล้ว</p>
          <p v-if="transactionHash" class="caption mt-2">
            Transaction: {{ transactionHash.slice(0, 10) }}...{{ transactionHash.slice(-8) }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="successDialog = false">ปิด</v-btn>
          <v-btn color="primary" @click="viewNFT">ดู NFT</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import { ethers } from "ethers";

const API_BASE = process.env.BACKEND_URL || "http://localhost:4000";
export default {
  name: "CreateNFTPage",

  data() {
    return {
      formValid: false,
      creating: false,
      successDialog: false,
      createdNFTId: null,
      transactionHash: null,

      fileInput: null,
      filePreviews: [],

      commissionRate: 0.1,

      formData: {
        files: [],
        name: "",
        externalLink: "",
        description: "",
        category: "",
        blockchain: "Ethereum",
        saleType: "fixed",
        price: "",
      },

      categories: ["งานศิลปะ", "เกม", "รูปภาพ", "อวตาร"],
      blockchains: ["Ethereum", "Polygon", "Binance Smart Chain"],
      saleTypes: [
        { text: "ราคาคงที่", value: "fixed" },
        { text: "ไม่ขาย", value: "not-for-sale" },
      ],

      nameRules: [
        (v) => !!v || "กรุณาใส่ชื่อ NFT",
        (v) => (v && v.length <= 50) || "ชื่อต้องไม่เกิน 50 ตัวอักษร",
      ],
      categoryRules: [(v) => !!v || "กรุณาเลือกหมวดหมู่"],
      priceRules: [
        (v) => !!v || "กรุณาใส่ราคา",
        (v) => v > 0 || "ราคาต้องมากกว่า 0",
      ],
    };
  },

  computed: {
    ...mapGetters("wallet", ["isConnected"]),

    fileRules() {
      return [
        () => {
          return (
            this.formData.files.length > 0 ||
            "กรุณาเลือกไฟล์"
          );
        },
        () => {
          return (
            this.formData.files.every((f) => f.size < 100000000) ||
            "แต่ละไฟล์ต้องไม่เกิน 100 MB"
          );
        },
      ];
    },

    netPrice() {
      const price = parseFloat(this.formData.price);
      if (!price || price <= 0) return null;
      const net = price * (1 - this.commissionRate);
      return net.toFixed(4);
    },

    priceToken() {
      const chainId = this.$store.state.wallet.chainId;
      const byChainId = {
        "0x1": "ETH",
        "0xaa36a7": "ETH",
        "0x38": "BNB",
        "0x61": "tBNB",
      };

      if (chainId && byChainId[chainId]) {
        return byChainId[chainId];
      }

      const byName = {
        Ethereum: "ETH",
        "Binance Smart Chain": "BNB",
        Polygon: "MATIC",
      };

      return byName[this.formData.blockchain] || "ETH";
    },

    priceIcon() {
      const chainId = this.$store.state.wallet.chainId;
      const byChainId = {
        "0x1": "mdi-ethereum",
        "0xaa36a7": "mdi-ethereum",
        "0x38": "mdi-alpha-b-circle",
        "0x61": "mdi-alpha-b-circle",
      };

      if (chainId && byChainId[chainId]) {
        return byChainId[chainId];
      }

      const byName = {
        Ethereum: "mdi-ethereum",
        "Binance Smart Chain": "mdi-alpha-b-circle",
        Polygon: "mdi-triangle",
      };

      return byName[this.formData.blockchain] || "mdi-ethereum";
    },
  },

  mounted() {
    if (!this.isConnected) {
      this.$nuxt.$emit("showNotification", {
        text: "กรุณาเชื่อมต่อกระเป๋า MetaMask ก่อนลงขายสินค้า",
        color: "warning",
      });
      this.$router.push("/");
    }
  },

  methods: {
    handleFileUpload(files) {
      if (!files || files.length === 0) {
        return;
      }

      // Clear previous files and previews
      this.formData.files = [];
      this.filePreviews = [];

      // Convert to array if needed
      const fileArray = Array.isArray(files) ? files : Array.from(files);

      fileArray.forEach((file) => {
        if (!file) return;

        // Add to formData
        this.formData.files.push(file);

        // Create preview
        const mime = file.type || "";
        const type = mime.split("/")[0] || "default";

        const preview = {
          type,
          name: file.name,
          size: file.size,
          src: null,
        };

        if (type === "image") {
          const reader = new FileReader();
          reader.onload = (e) => {
            preview.src = e.target.result;
          };
          reader.readAsDataURL(file);
        }

        this.filePreviews.push(preview);
      });
    },

    removeFile(index) {
      this.formData.files.splice(index, 1);
      this.filePreviews.splice(index, 1);

      // Clear file input if no files left
      if (this.formData.files.length === 0) {
        this.fileInput = null;
      }
    },

    resetForm() {
      this.$refs.createForm.reset();
      this.fileInput = null;
      this.filePreviews = [];
      this.formData.files = [];
      this.formData.name = "";
      this.formData.description = "";
      this.formData.externalLink = "";
      this.formData.category = "";
      this.formData.price = "";
      this.formData.saleType = "fixed";
      this.formData.blockchain = "Ethereum";
    },

    getFileIcon(type) {
      const icons = {
        video: "mdi-video",
        audio: "mdi-music",
        model: "mdi-cube-outline",
        default: "mdi-file",
      };
      return icons[type] || icons.default;
    },

    handleSaleTypeChange(type) {
      if (type === "not-for-sale") {
        this.formData.price = "";
      }
    },

    async createNFT() {
      if (!this.$refs.createForm.validate()) {
        this.$nuxt.$emit("showNotification", {
          text: "กรุณากรอกข้อมูลให้ครบถ้วน",
          color: "error",
        });
        return;
      }

      if (!this.formData.files || this.formData.files.length === 0) {
        this.$nuxt.$emit("showNotification", {
          text: "กรุณาเลือกไฟล์",
          color: "error",
        });
        return;
      }

      // Get owner address from wallet store
      const ownerAddress =
        this.$store?.state?.wallet?.account ||
        this.$store?.state?.wallet?.address ||
        "";

      if (!ownerAddress) {
        this.$nuxt.$emit("showNotification", {
          text: "ไม่พบที่อยู่กระเป๋า กรุณาเชื่อมต่อ MetaMask ก่อน",
          color: "error",
        });
        return;
      }

      console.log("Creating NFT with owner address:", ownerAddress);

      this.creating = true;

      try {
        const fd = new FormData();

        // Append all files
        this.formData.files.forEach((file) => {
          fd.append("files", file);
        });

        // Prepare metadata
        const metaForBackend = {
          name: this.formData.name,
          description: this.formData.description,
          external_url: this.formData.externalLink || "",
          category: this.formData.category,
          blockchain: this.formData.blockchain,
          sale_type: this.formData.saleType,
          price:
            this.formData.saleType !== "not-for-sale"
              ? this.formData.price
              : "0",
        };

        fd.append("metadata", JSON.stringify(metaForBackend));
        fd.append("ownerAddress", ownerAddress);

        console.log("Sending request to backend...");
        const res = await fetch(`${API_BASE}/api/nfts/create`, {
          method: "POST",
          body: fd,
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "สร้าง NFT ไม่สำเร็จ");
        }

        console.log("Backend prepared NFT + tx:", result);

        // 🔹 ดึง config ธุรกรรมที่ backend เตรียมให้
        const txConfig = result.transaction;
        if (!txConfig || !txConfig.to || !txConfig.data) {
          throw new Error("ข้อมูลธุรกรรมไม่ถูกต้อง");
        }

        if (!window.ethereum) {
          throw new Error("ไม่พบ MetaMask บนเบราว์เซอร์");
        }

        // 🔹 ส่ง transaction ผ่าน MetaMask ให้ user เป็นคนจ่าย gas
        const txParams = {
          from: ownerAddress,
          to: txConfig.to,
          data: txConfig.data,
          value: txConfig.value || "0x0",
        };

        console.log("Sending tx via MetaMask:", txParams);

        const txHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [txParams],
        });

        console.log("Mint tx hash:", txHash);

        // (ถ้าอยากรอให้ confirm จริง ๆ)
        try {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          await web3Provider.waitForTransaction(txHash);
        } catch (waitErr) {
          console.warn("waitForTransaction error (ไม่ critical):", waitErr);
        }

        // เก็บข้อมูลไว้โชว์ใน dialog
        this.createdNFTId = result.tokenId;
        this.transactionHash = txHash;
        this.successDialog = true;

        this.$nuxt.$emit("showNotification", {
          text: "สร้าง NFT สำเร็จ! ทำธุรกรรมบน Blockchain แล้ว",
          color: "success",
        });

        setTimeout(() => {
          this.resetForm();
        }, 1000);
      } catch (error) {
        console.error("Error creating NFT:", error);
        this.$nuxt.$emit("showNotification", {
          text: error.message || "เกิดข้อผิดพลาดในการสร้าง NFT",
          color: "error",
        });
      } finally {
        this.creating = false;
      }
    },

    viewNFT() {
      if (this.createdNFTId) {
        this.$router.push(`/nft/${this.createdNFTId}`);
      }
      this.successDialog = false;
    },
  },
};
</script>

<style scoped>
/* Custom styles */
</style>