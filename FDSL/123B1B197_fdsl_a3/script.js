const products = [
    {
        id: 1,
        name: "Men's Jacket",
        price: 2499,
        image: "https://images.unsplash.com/photo-1520975922203-b5b3b7a3b5b6"
    },
    {
        id: 2,
        name: "Women's Dress",
        price: 1999,
        image: "https://images.unsplash.com/photo-1520974735194-0f88f0b6e78b"
    },
    {
        id: 3,
        name: "Sneakers",
        price: 2999,
        image: "https://images.unsplash.com/photo-1528701800489-20be3c3c7e8a"
    },
    {
        id: 4,
        name: "Handbag",
        price: 1499,
        image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f"
    }
];

let cartCount = 0;

function displayProducts() {
    const productList = document.getElementById("product-list");

    products.forEach(product => {
        productList.innerHTML += `
            <div class="col-md-3 mb-4">
                <div class="card">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body text-center">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="price">₹ ${product.price}</p>
                        <button class="btn btn-primary" onclick="addToCart()">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

function addToCart() {
    cartCount++;
    document.getElementById("cart-count").innerText = cartCount;
}

displayProducts();