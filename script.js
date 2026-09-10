```javascript
// ==========================================
// SHOPY EASY - SCRIPT.JS
// GOOGLE LOGIN + CREATE SHOP
// VERCEL ONLY
// ==========================================

const VERCEL_URL =
    "https://shopy-easy-five.vercel.app";


// ==========================================
// GOOGLE LOGIN
// ==========================================

const googleLoginBtn =
    document.getElementById("googleLoginBtn");

if (googleLoginBtn) {

    googleLoginBtn.addEventListener(
        "click",
        async function () {

            try {

                const { error } =
                    await supabaseClient.auth
                        .signInWithOAuth({

                            provider: "google",

                            options: {

                                redirectTo:
                                    VERCEL_URL +
                                    "/index.html"

                            }

                        });

                if (error) {
                    throw error;
                }

            }

            catch (error) {

                console.error(
                    "Google Login Error:",
                    error
                );

                alert(
                    "Google Login failed:\n\n" +
                    error.message
                );
            }

        }
    );
}


// ==========================================
// CHECK LOGIN
// ==========================================

async function checkLogin() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .getUser();

        if (error) {
            console.error(error);
            return;
        }

        if (data.user) {

            const loginBtn =
                document.getElementById(
                    "googleLoginBtn"
                );

            if (loginBtn) {

                const user =
                    data.user;

                const userName =
                    user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    user.email?.split("@")[0] ||
                    "User";

                loginBtn.textContent =
                    userName;
            }
        }

    }

    catch (error) {

        console.error(
            "Login check error:",
            error
        );
    }
}

checkLogin();


// ==========================================
// CREATE SHOP
// ==========================================

const shopForm =
    document.getElementById("shopForm");

if (shopForm) {

    shopForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();
            event.stopPropagation();

            const createButton =
                shopForm.querySelector(
                    'button[type="submit"]'
                );

            if (createButton) {

                createButton.disabled = true;

                createButton.textContent =
                    "Creating Shop...";
            }

            try {

                // ==================================
                // CHECK SUPABASE
                // ==================================

                if (!window.supabaseClient) {

                    throw new Error(
                        "Supabase is not loaded."
                    );
                }


                // ==================================
                // CHECK LOGIN
                // ==================================

                const {
                    data: userData,
                    error: userError
                } =
                    await supabaseClient.auth
                        .getUser();

                if (
                    userError ||
                    !userData.user
                ) {

                    throw new Error(
                        "Please login first."
                    );
                }

                const user =
                    userData.user;


                // ==================================
                // CHECK ROLE
                // ==================================

                const {
                    data: profile,
                    error: profileError
                } =
                    await supabaseClient
                        .from("profiles")
                        .select("role")
                        .eq("id", user.id)
                        .single();

                if (profileError) {
                    throw profileError;
                }

                if (
                    !profile ||
                    !["member", "admin"]
                        .includes(profile.role)
                ) {

                    throw new Error(
                        "Only Admin and Member accounts can create a shop."
                    );
                }


                // ==================================
                // GET FORM DATA
                // ==================================

                const shopName =
                    document
                        .getElementById("shopName")
                        .value
                        .trim();

                const ownerName =
                    document
                        .getElementById("ownerName")
                        .value
                        .trim();

                const mobile =
                    document
                        .getElementById("mobile")
                        .value
                        .trim();

                const category =
                    document
                        .getElementById("category")
                        .value;

                const address =
                    document
                        .getElementById("address")
                        .value
                        .trim();

                const maps =
                    document
                        .getElementById("maps")
                        .value
                        .trim();

                const openingTime =
                    document
                        .getElementById("openingTime")
                        .value;

                const closingTime =
                    document
                        .getElementById("closingTime")
                        .value;


                if (!shopName) {

                    throw new Error(
                        "Please enter shop name."
                    );
                }


                // ==================================
                // CREATE UNIQUE SLUG
                // ==================================

                let shopSlug =
                    shopName
                        .toLowerCase()
                        .trim()
                        .replace(
                            /[^a-z0-9]+/g,
                            "-"
                        )
                        .replace(
                            /^-+|-+$/g,
                            ""
                        );

                if (!shopSlug) {

                    throw new Error(
                        "Invalid shop name."
                    );
                }

                shopSlug =
                    shopSlug +
                    "-" +
                    Date.now();


                // ==================================
                // FACILITIES
                // ==================================

                const facilities = [];

                document
                    .querySelectorAll(
                        ".facilities input:checked"
                    )
                    .forEach(function (item) {

                        facilities.push(
                            item.value
                        );

                    });


                // ==================================
                // UPLOAD FILES
                // ==================================

                async function uploadFiles(
                    inputId,
                    folderName
                ) {

                    const input =
                        document.getElementById(
                            inputId
                        );

                    if (
                        !input ||
                        !input.files ||
                        input.files.length === 0
                    ) {

                        return [];
                    }

                    const uploadedImages = [];


                    for (
                        const file of input.files
                    ) {

                        const safeFileName =
                            file.name.replace(
                                /[^a-zA-Z0-9._-]/g,
                                "_"
                            );

                        const filePath =
                            user.id +
                            "/" +
                            shopSlug +
                            "/" +
                            folderName +
                            "/" +
                            Date.now() +
                            "-" +
                            safeFileName;


                        const {
                            error: uploadError
                        } =
                            await supabaseClient
                                .storage
                                .from("shop-images")
                                .upload(
                                    filePath,
                                    file,
                                    {
                                        cacheControl:
                                            "3600",
                                        upsert: false
                                    }
                                );


                        if (uploadError) {
                            throw uploadError;
                        }


                        const {
                            data: publicData
                        } =
                            supabaseClient
                                .storage
                                .from(
                                    "shop-images"
                                )
                                .getPublicUrl(
                                    filePath
                                );


                        uploadedImages.push(
                            publicData.publicUrl
                        );
                    }


                    return uploadedImages;
                }


                // ==================================
                // UPLOAD ALL PHOTOS
                // ==================================

                createButton.textContent =
                    "Uploading Shop Photos...";

                const shopPhotos =
                    await uploadFiles(
                        "shopPhotos",
                        "shop"
                    );


                createButton.textContent =
                    "Uploading Menu Photos...";

                const menuPhotos =
                    await uploadFiles(
                        "menuPhotos",
                        "menu"
                    );


                createButton.textContent =
                    "Uploading Visiting Card...";

                const visitingCard =
                    await uploadFiles(
                        "visitingCard",
                        "visiting-card"
                    );


                createButton.textContent =
                    "Uploading Other Photos...";

                const otherPhotos =
                    await uploadFiles(
                        "otherPhotos",
                        "other"
                    );


                // ==================================
                // SAVE SHOP
                // ==================================

                createButton.textContent =
                    "Saving Shop...";

                const {
                    error: shopError
                } =
                    await supabaseClient
                        .from("shops")
                        .insert([{

                            owner_id:
                                user.id,

                            name:
                                shopName,

                            slug:
                                shopSlug,

                            owner_name:
                                ownerName,

                            mobile:
                                mobile,

                            category:
                                category,

                            address:
                                address,

                            maps:
                                maps,

                            opening_time:
                                openingTime || null,

                            closing_time:
                                closingTime || null,

                            facilities:
                                facilities,

                            shop_photos:
                                shopPhotos,

                            menu_photos:
                                menuPhotos,

                            visiting_card:
                                visitingCard,

                            other_photos:
                                otherPhotos,

                            published:
                                true

                        }]);


                if (shopError) {
                    throw shopError;
                }


                // ==================================
                // FINAL VERCEL URL
                // ==================================

                const publicShopURL =
                    VERCEL_URL +
                    "/shop.html?shop=" +
                    encodeURIComponent(
                        shopSlug
                    );


                console.log(
                    "SHOP CREATED:",
                    publicShopURL
                );


                alert(
                    "🎉 Shop created successfully!"
                );


                // ==================================
                // OPEN VERCEL SHOP PAGE
                // ==================================

                window.location.href =
                    publicShopURL;

            }

            catch (error) {

                console.error(
                    "Create Shop Error:",
                    error
                );

                alert(
                    "Something went wrong:\n\n" +
                    error.message
                );


                if (createButton) {

                    createButton.disabled =
                        false;

                    createButton.textContent =
                        "Create My Shop";
                }
            }

        }
    );
}
```
