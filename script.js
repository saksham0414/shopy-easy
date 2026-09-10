// ==========================================
// SHOPY EASY - SCRIPT.JS
// LOGIN + SECURE SHOP CREATION
// ==========================================


// ==========================================
// GOOGLE LOGIN
// ==========================================

const googleLoginBtn =
    document.getElementById("googleLoginBtn");

if (googleLoginBtn) {

    googleLoginBtn.addEventListener("click", async function () {

        const { error } =
            await supabaseClient.auth.signInWithOAuth({
                provider: "google",

                options: {
                    redirectTo:
                        window.location.origin +
                        "/shopy-easy/index.html"
                }
            });

        if (error) {
            console.error(error);
            alert(
                "Google Login failed: " +
                error.message
            );
        }
    });
}


// ==========================================
// CHECK GOOGLE LOGIN
// ==========================================

async function checkLogin() {

    const { data, error } =
        await supabaseClient.auth.getUser();

    if (error) {
        console.log(error);
        return;
    }

    if (data.user) {

        const loginBtn =
            document.getElementById("googleLoginBtn");

        if (loginBtn) {

            const user = data.user;

            const userName =
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split("@")[0] ||
                "User";

            loginBtn.textContent = userName;
        }

        console.log(
            "Logged in user:",
            data.user
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


            // ==================================
            // 1. CHECK LOGIN
            // ==================================

            const {
                data: { user },
                error: userError
            } =
                await supabaseClient.auth.getUser();

            if (userError || !user) {

                alert(
                    "Please login first to create a shop."
                );

                window.location.href =
                    "index.html";

                return;
            }


            // ==================================
            // 2. CHECK ROLE
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


            if (
                profileError ||
                !profile ||
                !["member", "admin"]
                    .includes(profile.role)
            ) {

                alert(
                    "Access Denied!\n\n" +
                    "Only Admin and Member accounts " +
                    "can create a shop."
                );

                return;
            }


            // ==================================
            // 3. GET SHOP INFORMATION
            // ==================================

            const shopName =
                document
                    .getElementById("shopName")
                    .value
                    .trim();

            if (!shopName) {

                alert(
                    "Please enter shop name."
                );

                return;
            }


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


            // ==================================
            // 4. CREATE UNIQUE SLUG
            // ==================================

            let shopSlug =
                shopName
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");


            if (!shopSlug) {

                alert(
                    "Invalid shop name."
                );

                return;
            }


            // Random unique number
            shopSlug =
                shopSlug +
                "-" +
                Date.now();


            // ==================================
            // 5. GET FACILITIES
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
            // 6. UPLOAD FILES TO SUPABASE
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
                    input.files.length === 0
                ) {

                    return [];
                }


                const uploadedImages = [];


                for (
                    const file of input.files
                ) {

                    const safeFileName =
                        file.name
                            .replace(
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


                    // Upload to Storage
                    const {
                        error: uploadError
                    } =
                        await supabaseClient
                            .storage
                            .from("shop-images")
                            .upload(
                                filePath,
                                file
                            );


                    if (uploadError) {

                        console.error(
                            "Upload error:",
                            uploadError
                        );

                        throw new Error(
                            "Photo upload failed: " +
                            file.name
                        );
                    }


                    // Get public URL
                    const {
                        data: publicData
                    } =
                        supabaseClient
                            .storage
                            .from("shop-images")
                            .getPublicUrl(
                                filePath
                            );


                    uploadedImages.push({

                        name:
                            file.name,

                        path:
                            filePath,

                        url:
                            publicData.publicUrl
                    });
                }


                return uploadedImages;
            }


            // ==================================
            // 7. BUTTON LOADING
            // ==================================

            const createButton =
                document.querySelector(
                    ".create-btn"
                );


            if (createButton) {

                createButton.disabled =
                    true;

                createButton.textContent =
                    "Creating Shop...";
            }


            try {

                // ==================================
                // 8. UPLOAD SHOP PHOTOS
                // ==================================

                const shopPhotos =
                    await uploadFiles(
                        "shopPhotos",
                        "shop"
                    );


                // ==================================
                // 9. UPLOAD MENU PHOTOS
                // ==================================

                const menuPhotos =
                    await uploadFiles(
                        "menuPhotos",
                        "menu"
                    );


                // ==================================
                // 10. UPLOAD VISITING CARD
                // ==================================

                const visitingCard =
                    await uploadFiles(
                        "visitingCard",
                        "visiting-card"
                    );


                // ==================================
                // 11. UPLOAD OTHER PHOTOS
                // ==================================

                const otherPhotos =
                    await uploadFiles(
                        "otherPhotos",
                        "other"
                    );


                // ==================================
                // 12. SAVE SHOP IN DATABASE
                // ==================================

                const {
                    data: shop,
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
                                openingTime ||
                                null,

                            closing_time:
                                closingTime ||
                                null,

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

                        }])
                        .select()
                        .single();


                // ==================================
                // 13. DATABASE ERROR
                // ==================================

                if (shopError) {

                    console.error(
                        "Database error:",
                        shopError
                    );

                    throw new Error(
                        shopError.message
                    );
                }


                // ==================================
                // 14. SUCCESS
                // ==================================

                alert(
                    "🎉 Shop created successfully!"
                );


                // ==================================
                // 15. OPEN PUBLIC SHOP
                // ==================================

                window.location.href =
                    "shop.html?shop=" +
                    encodeURIComponent(
                        shop.slug
                    );

            }

            catch (error) {

                console.error(
                    "Create shop error:",
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
