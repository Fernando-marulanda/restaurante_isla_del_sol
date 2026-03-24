window.addEventListener('DOMContentLoaded', () => {
    // Iniciar carga del menú tan pronto como el DOM esté listo
    loadMenu();
    
    // Manejo seguro del loader
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('loader-hidden');
        }, 1200);
    }
});

async function loadMenu() {
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) {
        console.error('El contenedor #menu-container no existe en el HTML');
        return;
    }
    
    try {
        // Añadimos un parámetro para evitar caché (?v=timestamp)
        const response = await fetch('public/data/menu.json?v=' + new Date().getTime());
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const categories = data.categories;
        const products = data.products;

        // Mapeo por IDs para el CSS Grid (Idem al que teníamos en PHP)
        const gridMap = {
            1: 'pescados',   // Lado izquierdo toda la altura
            2: 'carnes',     // Fila 1 derecha
            3: 'sopas',      // Fila 2 derecha
            4: 'acompanantes', // Fila 3 derecha
            5: 'bebidas'     // Fila 4 derecha   
        };

        menuContainer.innerHTML = '';

        categories.forEach(category => {
            const categoryProducts = products.filter(p => !p.categoria_id ? false : p.categoria_id == category.id);
            if (categoryProducts.length === 0) return;

            const gridClass = gridMap[category.id] || '';
            const categorySection = document.createElement('section');
            categorySection.className = `category-section ${gridClass}`;
            
            let productsHtml = '';
            categoryProducts.forEach(product => {
                const formattedPrice = new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    maximumFractionDigits: 0
                }).format(product.precio);

                productsHtml += `
                    <article class="product-item" onclick='openProductModal(${JSON.stringify(product)})'>
                        <header class="product-header">
                            <h3 class="product-name">${product.nombre}</h3>
                            <span class="product-price">${formattedPrice}</span>
                        </header>
                        <p class="product-description">${product.descripcion || ''}</p>
                    </article>
                `;
            });

            categorySection.innerHTML = `
                <div class="category-title-bubble">
                    ${category.nombre.toUpperCase()}
                </div>
                <div class="product-list">
                    ${productsHtml}
                </div>
            `;

            menuContainer.appendChild(categorySection);
        });

    } catch (error) {
        console.error('Error al cargar el menú:', error);
        if (menuContainer) {
            menuContainer.innerHTML = `<p style="color: white; text-align: center; padding: 20px;">
                Error al cargar el menú. Por favor, refresca la página (F5).
            </p>`;
        }
    }
}

// Modal Logic
const modal = document.getElementById('product-modal');

function openProductModal(product) {
    const nameEl = document.getElementById('modal-product-name');
    const descEl = document.getElementById('modal-product-description');
    const priceEl = document.getElementById('modal-product-price');
    const imgContainer = document.getElementById('modal-image-container');

    if (!nameEl || !descEl || !priceEl || !imgContainer || !modal) return;

    nameEl.textContent = product.nombre;
    descEl.textContent = product.descripcion || 'Sin descripción detallada disponible.';
    
    const formattedPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(product.precio);
    
    priceEl.textContent = formattedPrice;

    imgContainer.innerHTML = '';
    const baseUrl = 'public/images/products/';
    
    if (product.imagen) {
        const img = document.createElement('img');
        img.src = baseUrl + product.imagen;
        imgContainer.appendChild(img);
    }

    if (product.imagen_2) {
        const img2 = document.createElement('img');
        img2.src = baseUrl + product.imagen_2;
        imgContainer.appendChild(img2);
    }

    modal.style.display = 'flex';
}

function closeProductModal() {
    if (modal) modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        closeProductModal();
    }
}
