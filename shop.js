// ==========================================
// SHOPY EASY - PUBLIC SHOP PAGE
// ==========================================

// Check Supabase
if (typeof supabaseClient === "undefined") {
    alert("Supabase is not loaded.");
    throw new Error("supabaseClient not found");
}


// ==========================================
// GET SHOP SLUG FROM URL
// Example:
// shop.html?shop=rahul-cafe
// ==========================================

const urlParams = new URLSearchParams(window.location.search);
const shopSlug = urlParams.get("shop");


// ==========================================
// IF NO SHOP SLUG
// ==========================================

if (!shopSlug) {

    alert("This shop is not added.");

    window.location.href = "index.html";

}


// ==========================================
// LOAD SHOP
// ==========================================

async function loadShop() {

    try {

        const { data: shop, error } = await supabaseClient
            .from("shops")
            .select("*")
            .eq("slug", shopSlug)
            .eq("published", true)
            .single();


        // ------------------------------------------
        // SHOP NOT FOUND
        // ------------------------------------------

        if (error || !shop) {

            console.error("Shop loading error:", error);

            alert("This shop is not added.");

            return;
        }


        // ------------------------------------------
        // BASIC SHOP INFORMATION
        // ------------------------------------------

        const shopName =
            document.getElementById("shopName");

        const shopOwner =
            document.getElementById("shopOwner");

        const shopCategory =
            document.getElementById("shopCategory");

        const shopAddress =
            document.getElementById("shopAddress");

        const shopMobile =
            document.getElementById("shopMobile");

        const shopTiming =
            document.getElementById("shopTiming");


        if (shopName) {
            shopName.textContent =
                shop.name || "My Shop";
        }


        if (shopOwner) {
            shopOwner.textContent =
                shop.owner_name
                    ? "Owner: " + shop.owner_name
                    : "Welcome to our shop";
        }


        if (shopCategory) {
            shopCategory.textContent =
                shop.category || "SHOP";
        }


        if (shopAddress) {
            shopAddress.textContent =
                shop.address || "Not available";
        }


        if (shopMobile) {
            shopMobile.textContent =
                shop.mobile || "Not available";
        }


        // ==========================================
        // SHOP TIMING
        // ==========================================

        if (shopTiming) {

            if (shop.opening_time && shop.closing_time) {

                shopTiming.textContent =
                    shop.opening_time +
                    " - " +
                    shop.closing_time;

            } else {

                shopTiming.textContent =
                    "Not available";
            }
        }


        // ==========================================
        // FACILITIES
        // ==========================================

        displayFacilities(shop.facilities);


        // ==========================================
        // SHOP PHOTOS
        // ==========================================

        displayImages(
            shop.shop_photos,
            "shopPhotoGrid",
            "gallery-image"
        );


        // ==========================================
        // MENU PHOTOS
        // ==========================================

        displayImages(
            shop.menu_photos,
            "menuPhotoGrid",
            "document-image"
        );


        // ==========================================
        // VISITING CARD
        // ==========================================

        displayImages(
            shop.visiting_card,
            "visitingCardGrid",
            "document-image"
        );


        // ==========================================
        // OTHER PHOTOS
        // ==========================================

        displayImages(
            shop.other_photos,
            "otherPhotoGrid",
            "gallery-image"
        );


        // ==========================================
        // GOOGLE MAPS
        // ==========================================

        const mapsButton =
            document.getElementById("mapsButton");

        const locationText =
            document.getElementById("locationText");


        if (shop.maps) {

            mapsButton.href = shop.maps;

            mapsButton.style.display =
                "inline-block";

            locationText.textContent =
                "Tap the button below to see our exact location.";

        } else {

            mapsButton.style.display =
                "none";

            locationText.textContent =
                "Google Maps location has not been added.";
        }


        // ==========================================
        // GENERATE QR CODE
        // ==========================================

        generateQRCode();


    } catch (error) {

        console.error(
            "Unexpected error:",
            error
        );

        alert(
            "Something went wrong while loading this shop."
        );
    }
}


// ==========================================
// DISPLAY FACILITIES
// ==========================================

function displayFacilities(facilities) {

    const facilitiesList =
        document.getElementById("facilitiesList");


    if (!facilitiesList) {
        return;
    }


    facilitiesList.innerHTML = "";


    // Supabase JSONB can return an array
    if (
        Array.isArray(facilities) &&
        facilities.length > 0
    ) {

        facilities.forEach(function (facility) {

            const item =
                document.createElement("div");

            item.className =
                "facility-item";

            item.textContent =
                "✓ " + facility;

            facilitiesList.appendChild(item);

        });

    } else {

        facilitiesList.innerHTML =
            `<div class="empty-message">
                No facilities added.
            </div>`;
    }
}


// ==========================================
// DISPLAY IMAGES
// ==========================================

function displayImages(
    images,
    containerId,
    imageClass
) {

    const container =
        document.getElementById(containerId);


    if (!container) {
        return;
    }


    container.innerHTML = "";


    // No images
    if (
        !Array.isArray(images) ||
        images.length === 0
    ) {

        container.innerHTML =
            `<div class="empty-message">
                No photos uploaded.
            </div>`;

        return;
    }


    // ------------------------------------------
    // SHOW EVERY IMAGE ONE BY ONE
    // ------------------------------------------

    images.forEach(function (image, index) {

        let imageURL = "";
        let imageName = "Shop Image";


        // --------------------------------------
        // If database contains an object
        // --------------------------------------

        if (
            typeof image === "object" &&
            image !== null
        ) {

            imageURL =
                image.url ||
                image.publicUrl ||
                image.data ||
                image.path ||
                "";

            imageName =
                image.name ||
                "Shop Image";

        }


        // --------------------------------------
        // If database contains a direct URL
        // --------------------------------------

        else if (
            typeof image === "string"
        ) {

            imageURL = image;

        }


        // --------------------------------------
        // Ignore invalid image
        // --------------------------------------

        if (!imageURL) {
            return;
        }


        // --------------------------------------
        // Create wrapper
        // --------------------------------------

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "single-shop-image";


        // --------------------------------------
        // Create image
        // --------------------------------------

        const img =
            document.createElement("img");

        img.src = imageURL;

        img.alt =
            imageName ||
            "Shop Image";

        img.className =
            imageClass;


        // --------------------------------------
        // Prevent broken image layout
        // --------------------------------------

        img.loading = "lazy";


        // --------------------------------------
        // If image cannot load
        // --------------------------------------

        img.onerror = function () {

            wrapper.remove();

        };


        wrapper.appendChild(img);

        container.appendChild(wrapper);

    });
}


// ==========================================
// GENERATE SHOP QR CODE
// ==========================================

function generateQRCode() {

    const qrCode =
        document.getElementById("qrCode");


    if (!qrCode) {
        return;
    }


    // Current exact shop URL
    const currentURL =
        window.location.href;


    const qrURL =
        "https://api.qrserver.com/v1/create-qr-code/" +
        "?size=500x500&data=" +
        encodeURIComponent(currentURL);


    qrCode.src = qrURL;

    qrCode.alt =
        "QR Code for " + shopSlug;
}


// ==========================================
// DOWNLOAD QR CODE
// ==========================================

async function downloadQR() {

    const qr =
        document.getElementById("qrCode");


    if (!qr || !qr.src) {

        alert("QR code is not ready.");

        return;
    }


    try {

        const response =
            await fetch(qr.src);

        const blob =
            await response.blob();


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "Shopy-Easy-" +
            shopSlug +
            "-QR.png";


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);


        URL.revokeObjectURL(url);


    } catch (error) {

        console.error(
            "QR download error:",
            error
        );


        // Fallback
        window.open(
            qr.src,
            "_blank"
        );
    }
}


// ==========================================
// START
// ==========================================

loadShop();
