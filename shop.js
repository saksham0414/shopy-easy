// ==========================================
// SHOPY EASY - PUBLIC SHOP PAGE
// ==========================================

const params = new URLSearchParams(window.location.search);
const shopSlug = params.get("shop");


// ==========================================
// LOAD SHOP
// ==========================================

async function loadShop() {

    if (!shopSlug) {
        document.body.innerHTML =
            "<h2>Shop not found.</h2>";
        return;
    }

    try {

        const {
            data: shop,
            error
        } = await supabaseClient
            .from("shops")
            .select("*")
            .eq("slug", shopSlug)
            .eq("published", true)
            .single();

        if (error) {
            throw error;
        }

        if (!shop) {
            throw new Error("Shop not found.");
        }


        // ==================================
        // BASIC INFORMATION
        // ==================================

        const name =
            document.getElementById("shopName");

        const owner =
            document.getElementById("ownerName");

        const mobile =
            document.getElementById("mobile");

        const category =
            document.getElementById("category");

        const address =
            document.getElementById("address");

        const opening =
            document.getElementById("openingTime");

        const closing =
            document.getElementById("closingTime");


        if (name)
            name.textContent = shop.name || "";

        if (owner)
            owner.textContent =
                shop.owner_name || "";

        if (mobile)
            mobile.textContent =
                shop.mobile || "";

        if (category)
            category.textContent =
                shop.category || "";

        if (address)
            address.textContent =
                shop.address || "";

        if (opening)
            opening.textContent =
                shop.opening_time || "";

        if (closing)
            closing.textContent =
                shop.closing_time || "";


        // ==================================
        // FACILITIES
        // ==================================

        const facilitiesContainer =
            document.getElementById(
                "facilities"
            );

        if (facilitiesContainer) {

            facilitiesContainer.innerHTML = "";

            const facilities =
                shop.facilities || [];

            facilities.forEach(function (facility) {

                const span =
                    document.createElement("span");

                span.textContent =
                    "✓ " + facility;

                facilitiesContainer.appendChild(
                    span
                );
            });
        }


        // ==================================
        // MAP
        // ==================================

        const mapsButton =
            document.getElementById("maps");

        if (mapsButton && shop.maps) {

            mapsButton.href = shop.maps;
            mapsButton.target = "_blank";
            mapsButton.rel =
                "noopener noreferrer";
        }


        // ==================================
        // PHONE
        // ==================================

        const callButton =
            document.getElementById("callButton");

        if (callButton && shop.mobile) {

            callButton.href =
                "tel:" + shop.mobile;
        }


        // ==================================
        // DISPLAY IMAGES
        // ==================================

        function showImages(
            containerId,
            images
        ) {

            const container =
                document.getElementById(
                    containerId
                );

            if (!container) return;

            container.innerHTML = "";

            if (!images || images.length === 0) {
                return;
            }

            images.forEach(function (image) {

                const img =
                    document.createElement("img");

                img.src =
                    typeof image === "string"
                        ? image
                        : image.url;

                img.alt =
                    shop.name || "Shop";

                img.loading = "lazy";

                container.appendChild(img);
            });
        }


        showImages(
            "shopPhotos",
            shop.shop_photos
        );

        showImages(
            "menuPhotos",
            shop.menu_photos
        );

        showImages(
            "visitingCard",
            shop.visiting_card
        );

        showImages(
            "otherPhotos",
            shop.other_photos
        );


        // ==================================
        // QR CODE
        // ==================================

        // ==================================
// QR CODE
// ==================================

const qrImage =
    document.getElementById("qrCode");

if (qrImage) {

    const publicShopURL =
        "https://shopy-easy-five.vercel.app/shop.html?shop=" +
        encodeURIComponent(shop.slug);

    qrImage.src =
        "https://api.qrserver.com/v1/create-qr-code/" +
        "?size=500x500" +
        "&margin=10" +
        "&data=" +
        encodeURIComponent(publicShopURL);

    qrImage.style.cursor = "pointer";

    qrImage.onclick = function () {

        window.open(
            publicShopURL,
            "_blank"
        );
    };

    console.log(
        "QR URL:",
        publicShopURL
    );
}


// ==================================
// SHOP URL
// ==================================

const shopURL =
    document.getElementById("shopURL");

if (shopURL) {

    const publicShopURL =
        "https://shopy-easy-five.vercel.app/shop.html?shop=" +
        encodeURIComponent(shop.slug);

    shopURL.textContent =
        publicShopURL;

    shopURL.href =
        publicShopURL;

    shopURL.target = "_blank";
}
