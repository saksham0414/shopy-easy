const shopForm = document.getElementById("shopForm");


// ===============================
// CREATE SHOP
// ===============================

if (shopForm) {

    shopForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const shopName =
            document.getElementById("shopName").value.trim();

        if (!shopName) {
            alert("Please enter shop name.");
            return;
        }


        // Create shop URL slug
        const shopSlug = shopName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");


        // ===============================
        // FACILITIES
        // ===============================

        const facilityInputs =
            document.querySelectorAll(".facilities input:checked");

        const facilities = [];

        facilityInputs.forEach(function (item) {
            facilities.push(item.value);
        });


        // ===============================
        // CONVERT IMAGES
        // ===============================

        async function filesToBase64(fileInput) {

            const files = Array.from(fileInput.files);

            const images = [];

            for (const file of files) {

                const base64 = await new Promise(function (resolve, reject) {

                    const reader = new FileReader();

                    reader.onload = function () {
                        resolve(reader.result);
                    };

                    reader.onerror = function () {
                        reject(reader.error);
                    };

                    reader.readAsDataURL(file);

                });

                images.push({
                    name: file.name,
                    data: base64
                });
            }

            return images;
        }


        // ===============================
        // GET ALL PHOTOS
        // ===============================

        const shopPhotos =
            await filesToBase64(
                document.getElementById("shopPhotos")
            );

        const menuPhotos =
            await filesToBase64(
                document.getElementById("menuPhotos")
            );

        const visitingCard =
            await filesToBase64(
                document.getElementById("visitingCard")
            );

        const otherPhotos =
            await filesToBase64(
                document.getElementById("otherPhotos")
            );


        // ===============================
        // SHOP DATA
        // ===============================

        const shopData = {

            id: Date.now().toString(),

            name: shopName,

            owner:
                document.getElementById("ownerName").value.trim(),

            mobile:
                document.getElementById("mobile").value.trim(),

            category:
                document.getElementById("category").value,

            address:
                document.getElementById("address").value.trim(),

            maps:
                document.getElementById("maps").value.trim(),

            opening:
                document.getElementById("openingTime").value,

            closing:
                document.getElementById("closingTime").value,

            facilities: facilities,

            slug: shopSlug,

            // Images
            shopPhotos: shopPhotos,

            menuPhotos: menuPhotos,

            visitingCard: visitingCard,

            otherPhotos: otherPhotos

        };


        // ===============================
        // SAVE SHOP
        // ===============================

        try {

            localStorage.setItem(
                "shopyEasyShop",
                JSON.stringify(shopData)
            );

        } catch (error) {

            alert(
                "Photos are too large. Please use smaller images."
            );

            console.error(error);

            return;
        }


        // ===============================
        // OPEN SHOP PAGE
        // ===============================

        window.location.href =
            "shop.html?shop=" +
            encodeURIComponent(shopSlug);

    });

}// ===============================
// GOOGLE LOGIN
// ===============================

const googleLoginBtn = document.getElementById("googleLoginBtn");

if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", async function () {

        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: "google",
            options: {
               redirectTo: window.location.origin + "/shopy-easy/index.html"
            }
        });

        if (error) {
            console.error(error);
            alert("Google Login failed: " + error.message);
        }
    });
}// ===============================
// CHECK GOOGLE LOGIN
// ===============================

async function checkLogin() {

    const { data, error } = await supabaseClient.auth.getUser();

    if (error) {
        console.log(error);
        return;
    }

   if (data.user) {

    const loginBtn = document.getElementById("googleLoginBtn");

    if (loginBtn) {

        const user = data.user;

        // Google profile name
        const userName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "User";

        loginBtn.textContent = userName;
    }

    console.log("Logged in user:", data.user);
}
}

checkLogin();
