```javascript
// ==========================================
// SHOPY EASY - PUBLIC SHOP PAGE
// VERCEL ONLY
// ==========================================

const VERCEL_URL = "https://shopy-easy-five.vercel.app";

const params = new URLSearchParams(window.location.search);
const shopSlug = params.get("shop");

async function loadShop() {

    if (!shopSlug) {
        document.body.innerHTML = `
            <div style="padding:40px;text-align:center;">
                <h2>Shop not found</h2>
                <p>No shop link was provided.</p>
            </div>
        `;
        return;
    }

    try {

        if (!window.supabaseClient) {
            throw new Error("Supabase is not loaded.");
        }

        // ==========================================
        // GET SHOP
        // ==========================================

        const { data: shop, error } =
            await supabaseClient
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

        // ==========================================
        // BASIC INFORMATION
        // ==========================================

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

        if (name) {
            name.textContent = shop.name || "";
        }

        if (owner) {
            owner.textContent = shop.owner_name || "";
        }

        if (mobile) {
            mobile.textContent = shop.mobile || "";
        }

        if (category) {
            category.textContent = shop.category || "";
        }

        if (address) {
            address.textContent = shop.address || "";
        }

        if (opening) {
            opening.textContent =
                shop.opening_time || "";
        }

        if (closing) {
            closing.textContent =
                shop.closing_time || "";
        }

        // ==========================================
        // FACILITIES
        // ==========================================

        const facilitiesContainer =
            document.getElementById("facilities");

        if (facilitiesContainer) {

            facilitiesContainer.innerHTML = "";

            const facilities =
                Array.isArray(shop.facilities)
                    ? shop.facilities
                    : [];

            facilities.forEach(function (facility) {

                const span =
                    document.createElement("span");

                span.textContent =
                    "✓ " + facility;

                facilitiesContainer.appendChild(span);

            });
        }

        // ==========================================
        // GOOGLE MAPS
        // ==========================================

        const mapsButton =
            document.getElementById("maps");

        if (mapsButton) {

            if (shop.maps) {

                mapsButton.href = shop.maps;
                mapsButton.target = "_blank";
                mapsButton.rel =
                    "noopener noreferrer";

                mapsButton.style.display = "";

            } else {

                mapsButton.style.display = "none";

            }
        }

        // ==========================================
        // CALL BUTTON
        // ==========================================

        const callButton =
            document.getElementById("callButton");

        if (callButton) {

            if (shop.mobile) {

                callButton.href =
                    "tel:" + shop.mobile;

                callButton.style.display = "";

            } else {

                callButton.style.display = "none";

            }
        }

        // ==========================================
        // IMAGE DISPLAY
        // ==========================================

        function showImages(
            containerId,
            images
        ) {

            const container =
                document.getElementById(containerId);

            if (!container) {
                return;
            }

            container.innerHTML = "";

            if (!Array.isArray(images) ||
                images.length === 0) {

                return;
            }

            images.forEach(function (image) {

                const imageURL =
                    typeof image === "string"
                        ? image
                        : image?.url;

                if (!imageURL) {
                    return;
                }

                const img =
                    document.createElement("img");

                img.src = imageURL;

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

        // ==========================================
        // ⭐ ONE PERMANENT VERCEL SHOP URL
        // ==========================================

        const publicShopURL =
            VERCEL_URL +
            "/shop.html?shop=" +
            encodeURIComponent(shop.slug);

        console.log(
            "PUBLIC SHOP URL:",
            publicShopURL
        );

        // ==========================================
        // QR CODE
        // ==========================================

        const qrImage =
            document.getElementById("qrCode");

        if (qrImage) {

            const qrAPI =
                "https://api.qrserver.com/v1/create-qr-code/" +
                "?size=500x500" +
                "&margin=10" +
                "&data=" +
                encodeURIComponent(publicShopURL);

            qrImage.src = qrAPI;

            qrImage.alt =
                "QR Code for " +
                (shop.name || "Shop");

            qrImage.style.cursor =
                "pointer";

            qrImage.onclick =
                function () {

                    window.open(
                        publicShopURL,
                        "_blank"
                    );

                };
        }

        // ==========================================
        // VERCEL LINK BELOW QR
        // ==========================================

        const shopURL =
            document.getElementById("shopURL");

        if (shopURL) {

            shopURL.textContent =
                publicShopURL;

            shopURL.href =
                publicShopURL;

            shopURL.target = "_blank";

            shopURL.rel =
                "noopener noreferrer";
        }

    }

    catch (error) {

        console.error(
            "Shop loading error:",
            error
        );

        document.body.innerHTML = `
            <div style="
                padding:40px;
                text-align:center;
                font-family:Arial;
            ">
                <h2>Unable to load shop</h2>
                <p>${error.message}</p>
            </div>
        `;
    }
}


// ==========================================
// START
// ==========================================

loadShop();
```
