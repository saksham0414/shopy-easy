// SHOPY EASY - PUBLIC SHOP PAGE

const VERCEL_URL = "https://shopy-easy-five.vercel.app";
const params = new URLSearchParams(window.location.search);
const shopSlug = params.get("shop");

function setText(id, value, fallback = "Not available") {
    const element = document.getElementById(id);
    if (element) element.textContent = value || fallback;
}

function showError(message) {
    const status = document.getElementById("shopStatus");
    if (!status) return;
    status.textContent = message;
    status.style.display = "block";
}

function displayFacilities(list) {
    const box = document.getElementById("facilitiesList");
    if (!box) return;
    box.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
        box.innerHTML = '<div class="empty-message">No facilities added.</div>';
        return;
    }

    list.forEach(facility => {
        const item = document.createElement("div");
        item.className = "facility-item";
        item.textContent = "✓ " + facility;
        box.appendChild(item);
    });
}

function getImageURL(item) {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
        return item.url || item.publicUrl || item.public_url || "";
    }
    return "";
}

function displayImages(list, containerId, imageClass) {
    const box = document.getElementById(containerId);
    if (!box) return;
    box.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
        box.innerHTML = '<div class="empty-message">No photos uploaded.</div>';
        return;
    }

    let count = 0;

    list.forEach(item => {
        const url = getImageURL(item);
        if (!url) return;

        count++;
        const wrapper = document.createElement("div");
        wrapper.className = "single-shop-image";

        const img = document.createElement("img");
        img.src = url;
        img.alt = "Shop photo";
        img.className = imageClass;
        img.loading = "lazy";
        img.addEventListener("error", () => wrapper.remove());

        wrapper.appendChild(img);
        box.appendChild(wrapper);
    });

    if (count === 0) {
        box.innerHTML = '<div class="empty-message">No photos uploaded.</div>';
    }
}

function generateQRCode() {
    const qr = document.getElementById("qrCode");
    const link = document.getElementById("shopURL");
    if (!qr || !shopSlug) return;

    const publicShopURL =
        VERCEL_URL + "/shop.html?shop=" + encodeURIComponent(shopSlug);

    const qrURL =
        "https://api.qrserver.com/v1/create-qr-code/" +
        "?size=500x500&margin=10&data=" +
        encodeURIComponent(publicShopURL);

    qr.src = qrURL;
    qr.alt = "QR code for " + shopSlug;

    if (link) {
        link.href = publicShopURL;
        link.textContent = publicShopURL;
    }
}

function setupCallButton(mobile) {
    const button = document.getElementById("callButton");
    if (!button) return;

    if (!mobile) {
        button.style.display = "none";
        return;
    }

    button.href = "tel:" + mobile.replace(/[^0-9+]/g, "");
    button.style.display = "inline-block";
}

function setupMapsButton(maps) {
    const button = document.getElementById("mapsButton");
    if (!button) return;

    if (!maps) {
        button.style.display = "none";
        return;
    }

    button.href = maps;
    button.target = "_blank";
    button.rel = "noopener noreferrer";
    button.style.display = "inline-block";
}

async function loadShop() {
    if (!shopSlug) {
        showError("Shop link is missing.");
        return;
    }

    try {
        const { data: shop, error } = await supabaseClient
            .from("shops")
            .select("*")
            .eq("slug", shopSlug)
            .eq("published", true)
            .maybeSingle();

        if (error) throw error;
        if (!shop) {
            throw new Error("This shop does not exist or is not published.");
        }

        setText("shopName", shop.name, "My Shop");
        setText(
            "shopOwner",
            shop.owner_name ? "Owner: " + shop.owner_name : "Welcome to our shop"
        );
        setText("shopCategory", shop.category, "SHOP");
        setText("shopAddress", shop.address);
        setText("shopMobile", shop.mobile);

        const timing = document.getElementById("shopTiming");
        if (timing) {
            timing.textContent =
                shop.opening_time && shop.closing_time
                    ? `${shop.opening_time} - ${shop.closing_time}`
                    : "Not available";
        }

        setupCallButton(shop.mobile);
        setupMapsButton(shop.maps);
        displayFacilities(shop.facilities);
        displayImages(shop.shop_photos, "shopPhotoGrid", "gallery-image");
        displayImages(shop.menu_photos, "menuPhotoGrid", "document-image");
        displayImages(shop.visiting_card, "visitingCardGrid", "document-image");
        displayImages(shop.other_photos, "otherPhotoGrid", "gallery-image");
        generateQRCode();

        const status = document.getElementById("shopStatus");
        if (status) status.style.display = "none";
    } catch (error) {
        console.error("Shop loading error:", error);
        showError("Unable to load shop: " + (error.message || error));
    }
}

document.addEventListener("DOMContentLoaded", loadShop);
