// ================================
// SHOPY EASY
// PUBLIC SHOP PAGE
// ================================

const VERCEL_URL =
    "https://shopy-easy-five.vercel.app";

const params =
    new URLSearchParams(
        window.location.search
    );

const shopSlug =
    params.get("shop");


// ================================
// TEXT
// ================================

function setText(
    id,
    value,
    fallback = "Not available"
) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value || fallback;
    }
}


// ================================
// FACILITIES
// ================================

function displayFacilities(
    list
) {

    const box =
        document.getElementById(
            "facilitiesList"
        );

    if (!box) return;

    box.innerHTML = "";


    if (
        !Array.isArray(list) ||
        list.length === 0
    ) {

        box.innerHTML =
            '<div class="empty-message">No facilities added.</div>';

        return;
    }


    list.forEach(function (facility) {

        const item =
            document.createElement("div");

        item.className =
            "facility-item";

        item.textContent =
            "✓ " + facility;

        box.appendChild(item);

    });
}


// ================================
// IMAGES
// ================================

function displayImages(
    list,
    containerId,
    imageClass
) {

    const box =
        document.getElementById(
            containerId
        );

    if (!box) return;

    box.innerHTML = "";


    if (
        !Array.isArray(list) ||
        list.length === 0
    ) {

        box.innerHTML =
            '<div class="empty-message">No photos uploaded.</div>';

        return;
    }


    list.forEach(function (item) {

        let url = "";

        if (
            typeof item === "string"
        ) {

            url = item;

        } else if (
            item &&
            typeof item === "object"
        ) {

            url =
                item.url ||
                item.publicUrl ||
                "";
        }


        if (!url) return;


        const wrapper =
            document.createElement("div");

        wrapper.className =
            "single-shop-image";


        const img =
            document.createElement("img");

        img.src = url;

        img.alt =
            "Shop Image";

        img.className =
            imageClass;

        img.loading =
            "lazy";


        wrapper.appendChild(img);

        box.appendChild(wrapper);

    });
}


// ================================
// ERROR
// ================================

function showError(message) {

    const status =
        document.getElementById(
            "shopStatus"
        );

    if (status) {

        status.textContent =
            message;

        status.style.display =
            "block";
    }
}


// ================================
// QR CODE
// ================================

function generateQRCode() {

    const qr =
        document.getElementById(
            "qrCode"
        );

    const link =
        document.getElementById(
            "shopURL"
        );


    if (!qr || !shopSlug)
        return;


    const publicShopURL =
        VERCEL_URL +
        "/shop.html?shop=" +
        encodeURIComponent(
            shopSlug
        );


    const qrURL =
        "https://api.qrserver.com/v1/create-qr-code/" +
        "?size=500x500" +
        "&margin=10" +
        "&data=" +
        encodeURIComponent(
            publicShopURL
        );


    qr.src =
        qrURL;


    if (link) {

        link.href =
            publicShopURL;

        link.textContent =
            publicShopURL;
    }
}


// ================================
// LOAD SHOP
// ================================

async function loadShop() {

    if (!shopSlug) {

        showError(
            "Shop not found."
        );

        return;
    }


    try {

        const { data: shop, error } =
            await supabaseClient
                .from("shops")
                .select("*")
                .eq(
                    "slug",
                    shopSlug
                )
                .eq(
                    "published",
                    true
                )
                .maybeSingle();


        if (error)
            throw error;


        if (!shop) {

            throw new Error(
                "This shop does not exist or is not published."
            );
        }


        setText(
            "shopName",
            shop.name,
            "My Shop"
        );


        setText(
            "shopOwner",
            shop.owner_name
                ? "Owner: " +
                  shop.owner_name
                : "Welcome to our shop"
        );


        setText(
            "shopCategory",
            shop.category,
            "SHOP"
        );


        setText(
            "shopAddress",
            shop.address
        );


        setText(
            "shopMobile",
            shop.mobile
        );


        const timing =
            document.getElementById(
                "shopTiming"
            );


        if (timing) {

            timing.textContent =
                shop.opening_time &&
                shop.closing_time

                    ? shop.opening_time +
                      " - " +
                      shop.closing_time

                    : "Not available";
        }


        // CALL

        const callButton =
            document.getElementById(
                "callButton"
            );


        if (callButton) {

            if (shop.mobile) {

                callButton.href =
                    "tel:" +
                    shop.mobile.replace(
                        /[^0-9+]/g,
                        ""
                    );

                callButton.style.display =
                    "inline-block";

            } else {

                callButton.style.display =
                    "none";
            }
        }


        // MAPS

        const mapsButton =
            document.getElementById(
                "mapsButton"
            );


        if (mapsButton) {

            if (shop.maps) {

                mapsButton.href =
                    shop.maps;

                mapsButton.target =
                    "_blank";

                mapsButton.style.display =
                    "inline-block";

            } else {

                mapsButton.style.display =
                    "none";
            }
        }


        displayFacilities(
            shop.facilities
        );


        displayImages(
            shop.shop_photos,
            "shopPhotoGrid",
            "gallery-image"
        );


        displayImages(
            shop.menu_photos,
            "menuPhotoGrid",
            "document-image"
        );


        displayImages(
            shop.visiting_card,
            "visitingCardGrid",
            "document-image"
        );


        displayImages(
            shop.other_photos,
            "otherPhotoGrid",
            "gallery-image"
        );


        // QR

        generateQRCode();


        const status =
            document.getElementById(
                "shopStatus"
            );

        if (status)
            status.style.display =
                "none";


    } catch (error) {

        console.error(
            "Shop loading error:",
            error
        );

        showError(
            "Unable to load shop: " +
            error.message
        );
    }
}


loadShop();
