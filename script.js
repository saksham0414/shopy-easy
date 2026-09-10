// ================================
// SHOPY EASY
// LOGIN + CREATE SHOP
// ================================

const VERCEL_URL = "https://shopy-easy-five.vercel.app";


// ================================
// LOGIN BUTTON
// ================================

function setLoginButton(user) {

    const button = document.getElementById("googleLoginBtn");

    if (!button) return;

    if (user) {

        const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Logged in";

        button.textContent = name;

    } else {

        button.textContent = "Login with Google";

    }
}


// ================================
// CHECK LOGIN
// ================================

async function checkLogin() {

    try {

        const { data, error } =
            await supabaseClient.auth.getUser();

        if (error) throw error;

        setLoginButton(data.user || null);

        return data.user || null;

    } catch (error) {

        console.error("Login check error:", error);

        setLoginButton(null);

        return null;
    }
}


// ================================
// GOOGLE LOGIN
// ================================

const googleLoginBtn =
    document.getElementById("googleLoginBtn");

if (googleLoginBtn) {

    googleLoginBtn.addEventListener("click", async function () {

        googleLoginBtn.disabled = true;

        googleLoginBtn.textContent =
            "Opening Google...";

        try {

            const { error } =
                await supabaseClient.auth.signInWithOAuth({

                    provider: "google",

                    options: {

                        redirectTo:
                            VERCEL_URL + "/index.html"

                    }

                });

            if (error) throw error;

        } catch (error) {

            console.error(
                "Google Login Error:",
                error
            );

            alert(
                "Google Login failed:\n\n" +
                error.message
            );

            googleLoginBtn.disabled = false;

            googleLoginBtn.textContent =
                "Login with Google";
        }

    });
}


// ================================
// AUTH STATE
// ================================

supabaseClient.auth.onAuthStateChange(
    function (_event, session) {

        setLoginButton(
            session?.user || null
        );

    }
);

checkLogin();


// ================================
// CREATE SHOP
// ================================

const shopForm =
    document.getElementById("shopForm");

if (shopForm) {

    shopForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();
            event.stopPropagation();

            const button =
                shopForm.querySelector(
                    'button[type="submit"]'
                );

            function resetButton() {

                if (button) {

                    button.disabled = false;

                    button.textContent =
                        "Create My Shop";
                }
            }


            try {

                if (button) {

                    button.disabled = true;

                    button.textContent =
                        "Checking login...";
                }


                // -------------------------
                // GET USER
                // -------------------------

                const { data: userData, error: userError } =
                    await supabaseClient.auth.getUser();

                if (userError || !userData?.user) {

                    throw new Error(
                        "Please login with Google first."
                    );
                }

                const user =
                    userData.user;


                // -------------------------
                // GET PROFILE
                // -------------------------

                if (button) {

                    button.textContent =
                        "Checking account...";
                }

                const { data: profile, error: profileError } =
                    await supabaseClient
                        .from("profiles")
                        .select("role")
                        .eq("id", user.id)
                        .maybeSingle();

                if (profileError)
                    throw profileError;


                if (!profile) {

                    throw new Error(
                        "Profile not found. Please logout and login again."
                    );
                }


                if (
                    !["member", "admin"]
                        .includes(profile.role)
                ) {

                    throw new Error(
                        "Only Admin and Member accounts can create a shop."
                    );
                }


                // -------------------------
                // FORM VALUES
                // -------------------------

                function getValue(id) {

                    const element =
                        document.getElementById(id);

                    return element
                        ? element.value.trim()
                        : "";
                }


                const shopName =
                    getValue("shopName");

                const ownerName =
                    getValue("ownerName");

                const mobile =
                    getValue("mobile");

                const category =
                    document.getElementById(
                        "category"
                    )?.value || "";

                const address =
                    getValue("address");

                const maps =
                    getValue("maps");

                const openingTime =
                    document.getElementById(
                        "openingTime"
                    )?.value || "";

                const closingTime =
                    document.getElementById(
                        "closingTime"
                    )?.value || "";


                if (
                    !shopName ||
                    !ownerName ||
                    !mobile ||
                    !category ||
                    !address
                ) {

                    throw new Error(
                        "Please fill all required shop details."
                    );
                }


                // -------------------------
                // SLUG
                // -------------------------

                let shopSlug =
                    shopName
                        .toLowerCase()
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


                // -------------------------
                // FACILITIES
                // -------------------------

                const facilities = [];

                document
                    .querySelectorAll(
                        ".facilities input[type='checkbox']:checked"
                    )
                    .forEach(function (item) {

                        facilities.push(
                            item.value
                        );

                    });


                // -------------------------
                // FILE UPLOAD
                // -------------------------

                async function uploadFiles(
                    inputId,
                    folder
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


                    const urls = [];


                    for (
                        const file
                        of input.files
                    ) {

                        const safeName =
                            file.name.replace(
                                /[^a-zA-Z0-9._-]/g,
                                "_"
                            );


                        const filePath =
                            user.id +
                            "/" +
                            shopSlug +
                            "/" +
                            folder +
                            "/" +
                            Date.now() +
                            "-" +
                            safeName;


                        const { error } =
                            await supabaseClient
                                .storage
                                .from(
                                    "shop-images"
                                )
                                .upload(
                                    filePath,
                                    file,
                                    {
                                        cacheControl:
                                            "3600",

                                        upsert:
                                            false
                                    }
                                );


                        if (error) {

                            throw new Error(
                                "Photo upload failed: " +
                                error.message
                            );
                        }


                        const { data } =
                            supabaseClient
                                .storage
                                .from(
                                    "shop-images"
                                )
                                .getPublicUrl(
                                    filePath
                                );


                        urls.push(
                            data.publicUrl
                        );
                    }


                    return urls;
                }


                // -------------------------
                // UPLOAD
                // -------------------------

                if (button) {

                    button.textContent =
                        "Uploading photos...";
                }


                const shopPhotos =
                    await uploadFiles(
                        "shopPhotos",
                        "shop"
                    );


                const menuPhotos =
                    await uploadFiles(
                        "menuPhotos",
                        "menu"
                    );


                const visitingCard =
                    await uploadFiles(
                        "visitingCard",
                        "visiting-card"
                    );


                const otherPhotos =
                    await uploadFiles(
                        "otherPhotos",
                        "other"
                    );


                // -------------------------
                // SAVE SHOP
                // -------------------------

                if (button) {

                    button.textContent =
                        "Saving shop...";
                }


                const { error: shopError } =
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
                                maps || null,

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


                if (shopError)
                    throw shopError;


                // -------------------------
                // VERCEL SHOP URL
                // -------------------------

                const publicShopURL =
                    VERCEL_URL +
                    "/shop.html?shop=" +
                    encodeURIComponent(
                        shopSlug
                    );


                alert(
                    "Shop created successfully! 🎉"
                );


                window.location.assign(
                    publicShopURL
                );

            } catch (error) {

                console.error(
                    "Create Shop Error:",
                    error
                );

                alert(
                    "Something went wrong:\n\n" +
                    (
                        error.message ||
                        error
                    )
                );

                resetButton();
            }

        }
    );
}
