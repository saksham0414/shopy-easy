// SHOPY EASY - LOGIN + CREATE SHOP
// Works on Vercel and GitHub Pages.

const VERCEL_URL = "https://shopy-easy-five.vercel.app";
const STORAGE_BUCKET = "shop-images";

function getEl(id) {
    return document.getElementById(id);
}

function setLoginButton(user) {
    const button = getEl("googleLoginBtn");
    if (!button) return;

    if (user) {
        const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Logged in";
        button.textContent = name;
        button.title = "Logged in as " + (user.email || name);
    } else {
        button.textContent = "Login with Google";
        button.title = "Login with Google";
    }
}

async function getCurrentUser() {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) throw error;
    return data?.user || null;
}

async function loginWithGoogle() {
    const button = getEl("googleLoginBtn");
    if (!button) return;

    button.disabled = true;
    button.textContent = "Opening Google...";

    try {
        // The production URL is used so every created shop has one stable public URL.
        const redirectTo = VERCEL_URL + "/index.html";

        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo,
                queryParams: {
                    access_type: "offline",
                    prompt: "select_account"
                }
            }
        });

        if (error) throw error;
    } catch (error) {
        console.error("Google Login Error:", error);
        alert("Google Login failed:\n\n" + (error.message || error));
        button.disabled = false;
        button.textContent = "Login with Google";
    }
}

async function checkLogin() {
    try {
        const user = await getCurrentUser();
        setLoginButton(user);
        return user;
    } catch (error) {
        console.error("Login check error:", error);
        setLoginButton(null);
        return null;
    }
}

function collectFacilities() {
    return Array.from(
        document.querySelectorAll(
            ".facilities input[type='checkbox']:checked"
        )
    ).map(input => input.value);
}

function valueOf(id) {
    const element = getEl(id);
    return element ? element.value.trim() : "";
}

function makeSlug(name) {
    const base = name
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    if (!base) throw new Error("Please use a valid shop name.");

    return `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function safeFileName(name) {
    return name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(0, 120);
}

async function uploadFiles(inputId, folder, userId, shopSlug) {
    const input = getEl(inputId);
    if (!input?.files?.length) return [];

    const urls = [];

    for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];

        if (!file.type.startsWith("image/")) {
            throw new Error(`${file.name} is not an image file.`);
        }

        // Keep uploads reasonably sized for a simple public web app.
        if (file.size > 10 * 1024 * 1024) {
            throw new Error(`${file.name} is larger than 10 MB.`);
        }

        const filePath = [
            userId,
            shopSlug,
            folder,
            `${Date.now()}-${i}-${safeFileName(file.name)}`
        ].join("/");

        const { error: uploadError } = await supabaseClient.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
            });

        if (uploadError) {
            throw new Error(
                `Upload failed for ${file.name}: ${uploadError.message}`
            );
        }

        const { data } = supabaseClient.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(filePath);

        if (!data?.publicUrl) {
            throw new Error(`Could not create a public URL for ${file.name}.`);
        }

        urls.push(data.publicUrl);
    }

    return urls;
}

async function createShop(event) {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    const button = form.querySelector("button[type='submit']");

    const setButton = text => {
        if (button) {
            button.disabled = true;
            button.textContent = text;
        }
    };

    const resetButton = () => {
        if (button) {
            button.disabled = false;
            button.textContent = "Create My Shop";
        }
    };

    try {
        setButton("Checking login...");

        const user = await getCurrentUser();
        if (!user) {
            throw new Error("Please login with Google first.");
        }

        setButton("Checking account...");

        const { data: profile, error: profileError } = await supabaseClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) throw profileError;
        if (!profile) {
            throw new Error(
                "Your profile was not created yet. Logout, login with Google again, and try once more."
            );
        }

        if (!["admin", "member"].includes(profile.role)) {
            throw new Error(
                "Your account does not have permission to create a shop. Ask the admin to change your role to member or admin."
            );
        }

        const shopName = valueOf("shopName");
        const ownerName = valueOf("ownerName");
        const mobile = valueOf("mobile");
        const category = valueOf("category");
        const address = valueOf("address");
        const maps = valueOf("maps");
        const openingTime = valueOf("openingTime");
        const closingTime = valueOf("closingTime");

        if (!shopName || !ownerName || !mobile || !category || !address) {
            throw new Error("Please fill all required shop details.");
        }

        if (maps && !/^https?:\/\//i.test(maps)) {
            throw new Error("Google Maps link must start with http:// or https://");
        }

        const shopSlug = makeSlug(shopName);
        const facilities = collectFacilities();

        setButton("Uploading shop photos...");
        const shopPhotos = await uploadFiles("shopPhotos", "shop", user.id, shopSlug);

        setButton("Uploading menu photos...");
        const menuPhotos = await uploadFiles("menuPhotos", "menu", user.id, shopSlug);

        setButton("Uploading visiting card...");
        const visitingCard = await uploadFiles("visitingCard", "visiting-card", user.id, shopSlug);

        setButton("Uploading other photos...");
        const otherPhotos = await uploadFiles("otherPhotos", "other", user.id, shopSlug);

        setButton("Saving shop...");

        const { data: createdShop, error: shopError } = await supabaseClient
            .from("shops")
            .insert({
                owner_id: user.id,
                name: shopName,
                slug: shopSlug,
                owner_name: ownerName,
                mobile,
                category,
                address,
                maps: maps || null,
                opening_time: openingTime || null,
                closing_time: closingTime || null,
                facilities,
                shop_photos: shopPhotos,
                menu_photos: menuPhotos,
                visiting_card: visitingCard,
                other_photos: otherPhotos,
                published: true
            })
            .select("id, slug")
            .single();

        if (shopError) throw shopError;

        const finalSlug = createdShop?.slug || shopSlug;
        const publicShopURL =
            VERCEL_URL + "/shop.html?shop=" + encodeURIComponent(finalSlug);

        alert("Shop created successfully! 🎉");
        window.location.href = publicShopURL;
    } catch (error) {
        console.error("Create Shop Error:", error);
        alert("Something went wrong:\n\n" + (error.message || error));
        resetButton();
    }
}

// Run after the HTML has loaded.
document.addEventListener("DOMContentLoaded", () => {
    const loginButton = getEl("googleLoginBtn");
    if (loginButton) loginButton.addEventListener("click", loginWithGoogle);

    const form = getEl("shopForm");
    if (form) form.addEventListener("submit", createShop);

    checkLogin();
});

// Keep the UI in sync after OAuth login/logout.
supabaseClient.auth.onAuthStateChange((_event, session) => {
    setLoginButton(session?.user || null);
});
