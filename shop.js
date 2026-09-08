const savedShop =
    localStorage.getItem("shopyEasyShop");


if (!savedShop) {

    alert("No shop information found.");

    window.location.href =
        "create-shop.html";

} else {

    const shop =
        JSON.parse(savedShop);


    // =================================
    // BASIC INFORMATION
    // =================================

    document.getElementById("shopName")
        .textContent = shop.name;

    document.getElementById("shopOwner")
        .textContent =
        "Owner: " + shop.owner;

    document.getElementById("shopCategory")
        .textContent =
        shop.category;


    document.getElementById("shopAddress")
        .textContent =
        shop.address;


    document.getElementById("shopMobile")
        .textContent =
        shop.mobile;


    // =================================
    // TIMING
    // =================================

    let timing = "Not available";


    if (shop.opening && shop.closing) {

        timing =
            shop.opening +
            " - " +
            shop.closing;

    }


    document.getElementById("shopTiming")
        .textContent =
        timing;


    // =================================
    // FACILITIES
    // =================================

    const facilitiesList =
        document.getElementById(
            "facilitiesList"
        );


    if (
        shop.facilities &&
        shop.facilities.length > 0
    ) {

        shop.facilities.forEach(
            function (facility) {

                const item =
                    document.createElement("div");

                item.className =
                    "facility-item";

                item.textContent =
                    "✓ " + facility;

                facilitiesList.appendChild(item);

            }
        );

    } else {

        facilitiesList.innerHTML =
            `<div class="empty-message">
                No facilities added.
            </div>`;

    }


    // =================================
    // IMAGE FUNCTION
    // =================================

    function displayImages(
        images,
        containerId,
        imageClass
    ) {

        const container =
            document.getElementById(
                containerId
            );


        if (
            images &&
            images.length > 0
        ) {

            images.forEach(
                function (image) {

                    const img =
                        document.createElement("img");

                    img.src =
                        image.data;

                    img.alt =
                        image.name;

                    img.className =
                        imageClass;

                    container.appendChild(img);

                }
            );

        } else {

            container.innerHTML =
                `<div class="empty-message">
                    No photos uploaded.
                </div>`;

        }

    }


    // =================================
    // SHOP PHOTOS
    // =================================

    displayImages(
        shop.shopPhotos,
        "shopPhotoGrid",
        "gallery-image"
    );


    // =================================
    // MENU PHOTOS
    // =================================

    displayImages(
        shop.menuPhotos,
        "menuPhotoGrid",
        "document-image"
    );


    // =================================
    // VISITING CARD
    // =================================

    displayImages(
        shop.visitingCard,
        "visitingCardGrid",
        "document-image"
    );


    // =================================
    // OTHER PHOTOS
    // =================================

    displayImages(
        shop.otherPhotos,
        "otherPhotoGrid",
        "gallery-image"
    );


    // =================================
    // GOOGLE MAPS
    // =================================

    const mapsButton =
        document.getElementById(
            "mapsButton"
        );


    const locationText =
        document.getElementById(
            "locationText"
        );


    if (shop.maps) {

        mapsButton.href =
            shop.maps;

        locationText.textContent =
            "Tap the button below to see our exact location.";

    } else {

        mapsButton.style.display =
            "none";

        locationText.textContent =
            "Google Maps location has not been added.";

    }


    // =================================
    // QR CODE
    // =================================

    const currentURL =
        window.location.href;


    const qrURL =
        "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data="
        + encodeURIComponent(currentURL);


    document.getElementById("qrCode")
        .src = qrURL;

}


// =====================================
// DOWNLOAD QR
// =====================================

function downloadQR() {

    const qr =
        document.getElementById("qrCode");


    const link =
        document.createElement("a");


    link.href =
        qr.src;

    link.download =
        "Shopy-Easy-QR.png";


    link.click();

}