// ========== INITIALISATION ==========
if (!localStorage.getItem('justemarket_merchants')) {
    localStorage.setItem('justemarket_merchants', JSON.stringify([]));
}
if (!localStorage.getItem('justemarket_pending_requests')) {
    localStorage.setItem('justemarket_pending_requests', JSON.stringify([]));
}

// ========== EFFETS D'ANIMATION ==========
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.pricing-card, .step-card, .testimonial-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
    
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', function() {
            nav.classList.toggle('show');
            if (nav.classList.contains('show')) {
                nav.style.display = 'flex';
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '70px';
                nav.style.left = '0';
                nav.style.right = '0';
                nav.style.background = 'rgba(10,10,42,0.95)';
                nav.style.backdropFilter = 'blur(20px)';
                nav.style.padding = '20px';
                nav.style.gap = '15px';
            } else {
                nav.style.display = '';
            }
        });
    }
});

// ========== INSCRIPTION ==========
if (document.getElementById('registerForm')) {
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    if (plan) {
        const activitySelect = document.getElementById('activity');
        if (activitySelect) activitySelect.value = plan;
    }
    
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const merchant = {
            id: Date.now(),
            businessName: document.getElementById('businessName').value,
            ownerName: document.getElementById('ownerName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            activity: document.getElementById('activity').value,
            status: 'pending_payment',
            subscriptionDate: null,
            expiryDate: null,
            accessKey: null,
            createdAt: new Date().toISOString()
        };
        
        if (!merchant.businessName || !merchant.ownerName || !merchant.phone || !merchant.password) {
            alert('❌ Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        localStorage.setItem('temp_merchant', JSON.stringify(merchant));
        window.location.href = 'subscription.html';
    });
}

// ========== PAGE ABONNEMENT ==========
if (window.location.pathname.includes('subscription.html')) {
    const tempMerchant = JSON.parse(localStorage.getItem('temp_merchant'));
    
    if (!tempMerchant) {
        window.location.href = 'register.html';
    }
    
    let planPrice = 0;
    let planName = '';
    
    switch(tempMerchant.activity) {
        case 'small':
            planPrice = 1000;
            planName = 'Petit commerce';
            break;
        case 'medium':
            planPrice = 2500;
            planName = 'Boutique moyenne';
            break;
        case 'large':
            planPrice = 5000;
            planName = 'Grand commerce';
            break;
    }
    
    const planInfo = document.getElementById('planInfo');
    if (planInfo) {
        planInfo.innerHTML = `
            <div style="background: rgba(33,150,243,0.1); padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <h3>📦 ${planName}</h3>
                <p>Montant à payer : <strong style="color: #e67e22; font-size: 24px;">${planPrice.toLocaleString()} FCFA</strong></p>
                <p>Boutique : ${escapeHtml(tempMerchant.businessName)}</p>
                <p>Téléphone : ${tempMerchant.phone}</p>
            </div>
        `;
    }
    
    const lejustePhone = document.getElementById('lejustePhone');
    const lejusteWhatsApp = document.getElementById('lejusteWhatsApp');
    if (lejustePhone) lejustePhone.textContent = '6XX XXX XXX';
    if (lejusteWhatsApp) lejusteWhatsApp.textContent = '6XX XXX XXX';
    
    window.requestKey = function() {
        const pendingRequests = JSON.parse(localStorage.getItem('justemarket_pending_requests') || '[]');
        const transactionCode = document.getElementById('transactionCode')?.value || '';
        
        pendingRequests.push({
            id: Date.now(),
            businessName: tempMerchant.businessName,
            ownerName: tempMerchant.ownerName,
            phone: tempMerchant.phone,
            activity: tempMerchant.activity,
            amount: planPrice,
            transactionCode: transactionCode || 'Non fourni',
            date: new Date().toLocaleString(),
            status: 'pending'
        });
        
        localStorage.setItem('justemarket_pending_requests', JSON.stringify(pendingRequests));
        
        const keyMessage = document.getElementById('keyMessage');
        if (keyMessage) keyMessage.style.display = 'block';
        
        alert(`✅ Demande envoyée !\n\n📞 Lejuste vous contactera sous 5 minutes au ${tempMerchant.phone}\n🔑 Vous recevrez votre clé d'accès par WhatsApp.`);
    };
}

// ========== CONNEXION ==========
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const accessKey = document.getElementById('accessKey').value;
        const merchants = JSON.parse(localStorage.getItem('justemarket_merchants') || '[]');
        const merchant = merchants.find(m => m.accessKey === accessKey);
        
        if (!merchant) {
            alert('❌ Clé invalide. Vérifiez votre clé d\'accès.');
            return;
        }
        
        if (merchant.status !== 'active') {
            alert('❌ Votre abonnement n\'est pas actif. Contactez Lejuste.');
            return;
        }
        
        const expiryDate = new Date(merchant.expiryDate);
        if (expiryDate < new Date()) {
            alert('❌ Votre abonnement a expiré. Veuillez renouveler.');
            return;
        }
        
        localStorage.setItem('justemarket_current_key', accessKey);
        localStorage.setItem('justemarket_current_merchant', JSON.stringify(merchant));
        window.location.href = 'dashboard.html';
    });
}

window.showHelp = function() {
    alert('📞 Contactez Lejuste directement sur WhatsApp au 6XX XXX XXX pour obtenir votre clé.');
};

// ========== DASHBOARD COMMERÇANT ==========
if (window.location.pathname.includes('dashboard.html')) {
    const currentKey = localStorage.getItem('justemarket_current_key');
    const currentMerchant = JSON.parse(localStorage.getItem('justemarket_current_merchant'));
    
    if (!currentMerchant) {
        window.location.href = 'login.html';
    }
    
    const businessNameSpan = document.getElementById('businessName');
    const displayAccessKeySpan = document.getElementById('displayAccessKey');
    const expiryDateSpan = document.getElementById('expiryDate');
    const planTypeSpan = document.getElementById('planType');
    
    if (businessNameSpan) businessNameSpan.textContent = currentMerchant.businessName;
    if (displayAccessKeySpan) displayAccessKeySpan.textContent = currentKey;
    if (expiryDateSpan) {
        const expiryDate = new Date(currentMerchant.expiryDate);
        expiryDateSpan.textContent = expiryDate.toLocaleDateString();
    }
    
    let planTypeText = '';
    switch(currentMerchant.activity) {
        case 'small': planTypeText = 'Petit commerce (1 000 FCFA/mois)'; break;
        case 'medium': planTypeText = 'Boutique moyenne (2 500 FCFA/mois)'; break;
        case 'large': planTypeText = 'Grand commerce (5 000 FCFA/mois)'; break;
    }
    if (planTypeSpan) planTypeSpan.textContent = planTypeText;
    
    let products = JSON.parse(localStorage.getItem(`products_${currentKey}`) || '[]');
    let orders = JSON.parse(localStorage.getItem(`orders_${currentKey}`) || '[]');
    
    const totalProductsSpan = document.getElementById('totalProducts');
    const totalOrdersSpan = document.getElementById('totalOrders');
    const totalRevenueSpan = document.getElementById('totalRevenue');
    
    if (totalProductsSpan) totalProductsSpan.textContent = products.length;
    if (totalOrdersSpan) totalOrdersSpan.textContent = orders.length;
    
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    if (totalRevenueSpan) totalRevenueSpan.textContent = totalRevenue.toLocaleString();
    
    function displayProducts() {
        const container = document.getElementById('productsList');
        if (!container) return;
        
        if (products.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:40px;">📦 Aucun produit. Cliquez sur "Ajouter un produit" pour commencer.</p>';
            return;
        }
        
        container.innerHTML = products.map(p => `
            <div class="product-item">
                <div>
                    <strong>${escapeHtml(p.name)}</strong><br>
                    ${p.price.toLocaleString()} FCFA - Stock: ${p.stock || 0}
                </div>
                <div>
                    <button onclick="deleteProduct(${p.id})" class="btn-outline" style="padding:5px 15px;">🗑️ Supprimer</button>
                </div>
            </div>
        `).join('');
    }
    
    function displayOrders() {
        const container = document.getElementById('ordersList');
        if (!container) return;
        
        if (orders.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:40px;">📋 Aucune commande pour le moment.</p>';
            return;
        }
        
        container.innerHTML = orders.map(o => `
            <div class="order-item">
                <div>
                    <strong>👤 ${escapeHtml(o.customerName)}</strong><br>
                    📞 ${o.customerPhone}<br>
                    📍 ${escapeHtml(o.customerAddress)}<br>
                    📦 ${o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}<br>
                    💰 ${o.total.toLocaleString()} FCFA
                </div>
                <div>
                    <span style="background:#27ae60; padding:5px 12px; border-radius:20px; font-size:12px;">${o.status}</span>
                </div>
            </div>
        `).join('');
    }
    
    window.showAddProduct = function() {
        const form = document.getElementById('addProductForm');
        if (form) form.style.display = 'block';
    };
    
    window.addProduct = function() {
        const name = document.getElementById('productName').value;
        const price = parseInt(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value) || 0;
        
        if (!name || !price) {
            alert('❌ Veuillez remplir le nom et le prix');
            return;
        }
        
        products.push({ id: Date.now(), name: name, price: price, stock: stock });
        localStorage.setItem(`products_${currentKey}`, JSON.stringify(products));
        
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productStock').value = '';
        
        const addForm = document.getElementById('addProductForm');
        if (addForm) addForm.style.display = 'none';
        
        displayProducts();
        if (totalProductsSpan) totalProductsSpan.textContent = products.length;
        alert('✅ Produit ajouté avec succès !');
    };
    
    window.deleteProduct = function(id) {
        if (confirm('Supprimer ce produit ?')) {
            products = products.filter(p => p.id !== id);
            localStorage.setItem(`products_${currentKey}`, JSON.stringify(products));
            displayProducts();
            if (totalProductsSpan) totalProductsSpan.textContent = products.length;
        }
    };
    
    window.renewSubscription = function() {
        window.location.href = 'subscription.html';
    };
    
    displayProducts();
    displayOrders();
}

// ========== PANEL ADMIN ==========
if (window.location.pathname.includes('admin.html')) {
    const isAdmin = localStorage.getItem('justemarket_admin_logged') === 'true';
    
    if (!isAdmin) {
        const password = prompt('👑 Panel Admin réservé. Entrez le mot de passe :');
        if (password === 'lejuste2025') {
            localStorage.setItem('justemarket_admin_logged', 'true');
        } else {
            alert('⛔ Accès refusé');
            window.location.href = 'index.html';
        }
    }
    
    function loadMerchants() {
        const merchants = JSON.parse(localStorage.getItem('justemarket_merchants') || '[]');
        const activeMerchants = merchants.filter(m => m.status === 'active');
        
        let totalRevenue = 0;
        for (let m of merchants) {
            if (m.activity === 'small') totalRevenue += 1000;
            else if (m.activity === 'medium') totalRevenue += 2500;
            else if (m.activity === 'large') totalRevenue += 5000;
        }
        
        const totalMerchantsSpan = document.getElementById('totalMerchants');
        const totalRevenueSpan = document.getElementById('totalRevenue');
        const activeSubscriptionsSpan = document.getElementById('activeSubscriptions');
        
        if (totalMerchantsSpan) totalMerchantsSpan.textContent = merchants.length;
        if (totalRevenueSpan) totalRevenueSpan.textContent = totalRevenue.toLocaleString();
        if (activeSubscriptionsSpan) activeSubscriptionsSpan.textContent = activeMerchants.length;
        
        const container = document.getElementById('merchantsList');
        if (!container) return;
        
        if (merchants.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:40px;">📭 Aucun commerçant inscrit pour le moment.</p>';
            return;
        }
        
        container.innerHTML = merchants.map(m => `
            <div class="merchant-item">
                <div>
                    <strong>🏪 ${escapeHtml(m.businessName)}</strong><br>
                    👤 ${escapeHtml(m.ownerName)}<br>
                    📞 ${m.phone}<br>
                    🔑 ${m.accessKey || 'En attente de paiement'}<br>
                    📦 ${m.activity === 'small' ? 'Petit commerce' : m.activity === 'medium' ? 'Boutique moyenne' : 'Grand commerce'}<br>
                    ${m.expiryDate ? `📅 Expire: ${new Date(m.expiryDate).toLocaleDateString()}` : ''}
                </div>
                <div>
                    <span style="background:${m.status === 'active' ? '#27ae60' : '#e67e22'}; padding:5px 12px; border-radius:20px; font-size:12px;">
                        ${m.status === 'active' ? '✅ Actif' : '⏳ En attente'}
                    </span>
                    <button onclick="deleteMerchant(${m.id})" style="background:#e74c3c; color:white; border:none; padding:5px 15px; border-radius:8px; margin-left:10px; cursor:pointer;">🗑️</button>
                </div>
            </div>
        `).join('');
    }
    
    function loadPendingRequests() {
        const requests = JSON.parse(localStorage.getItem('justemarket_pending_requests') || '[]');
        const container = document.getElementById('pendingRequests');
        if (!container) return;
        
        const pending = requests.filter(r => r.status === 'pending');
        
        if (pending.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:20px;">📭 Aucune demande en attente</p>';
            return;
        }
        
        container.innerHTML = pending.map(req => `
            <div class="request-item" style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                    <div>
                        <strong>🏪 ${escapeHtml(req.businessName)}</strong><br>
                        👤 ${escapeHtml(req.ownerName)}<br>
                        📞 ${req.phone}<br>
                        💰 ${req.amount.toLocaleString()} FCFA - ${req.activity === 'small' ? 'Petit commerce' : req.activity === 'medium' ? 'Boutique moyenne' : 'Grand commerce'}<br>
                        📅 ${req.date}<br>
                        ${req.transactionCode ? `📝 Code: ${req.transactionCode}` : ''}
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <button onclick="generateAndSendKey(${req.id}, '${req.phone}', '${req.businessName}')" style="background: linear-gradient(135deg, #e67e22, #d35400); color:white; border:none; padding:10px 20px; border-radius:10px; cursor:pointer;">🔑 Générer la clé</button>
                        <button onclick="deleteRequest(${req.id})" style="background:#e74c3c; color:white; border:none; padding:10px 20px; border-radius:10px; cursor:pointer;">🗑️ Refuser</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    window.generateAndSendKey = function(requestId, phone, businessName) {
        const accessKey = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        const requests = JSON.parse(localStorage.getItem('justemarket_pending_requests') || '[]');
        const request = requests.find(r => r.id === requestId);
        
        if (request) {
            const now = new Date();
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            
            const newMerchant = {
                id: Date.now(),
                businessName: request.businessName,
                ownerName: request.ownerName,
                phone: request.phone,
                email: '',
                password: accessKey,
                activity: request.activity,
                status: 'active',
                subscriptionDate: now.toISOString(),
                expiryDate: expiryDate.toISOString(),
                accessKey: accessKey,
                createdAt: now.toISOString()
            };
            
            const merchants = JSON.parse(localStorage.getItem('justemarket_merchants') || '[]');
            merchants.push(newMerchant);
            localStorage.setItem('justemarket_merchants', JSON.stringify(merchants));
            
            localStorage.setItem(`products_${accessKey}`, JSON.stringify([]));
            localStorage.setItem(`orders_${accessKey}`, JSON.stringify([]));
            
            request.status = 'completed';
            request.accessKey = accessKey;
            localStorage.setItem('justemarket_pending_requests', JSON.stringify(requests));
            
            alert(`✅ Clé générée pour ${businessName} !\n\n🔑 Clé d'accès : ${accessKey}\n\n📱 Envoyez cette clé par WhatsApp au ${phone}\n\nLe commerçant pourra se connecter avec cette clé.`);
            
            navigator.clipboard.writeText(accessKey).then(() => {
                alert("📋 Clé copiée dans le presse-papier !");
            }).catch(() => {
                alert("📋 Copiez manuellement la clé : " + accessKey);
            });
            
            loadPendingRequests();
            loadMerchants();
        }
    };
    
    window.deleteRequest = function(requestId) {
        if (confirm('Refuser cette demande ?')) {
            let requests = JSON.parse(localStorage.getItem('justemarket_pending_requests') || '[]');
            requests = requests.filter(r => r.id !== requestId);
            localStorage.setItem('justemarket_pending_requests', JSON.stringify(requests));
            loadPendingRequests();
            alert('✅ Demande refusée');
        }
    };
    
    window.deleteMerchant = function(id) {
        if (confirm('⚠️ Supprimer définitivement ce commerçant ?')) {
            let merchants = JSON.parse(localStorage.getItem('justemarket_merchants') || '[]');
            merchants = merchants.filter(m => m.id !== id);
            localStorage.setItem('justemarket_merchants', JSON.stringify(merchants));
            loadMerchants();
            alert('✅ Commerçant supprimé');
        }
    };
    
    window.exportData = function() {
        const merchants = JSON.parse(localStorage.getItem('justemarket_merchants') || '[]');
        const dataStr = JSON.stringify(merchants, null, 2);
        const blob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `justemarket_export_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('📊 Export terminé !');
    };
    
    window.showAddMerchant = function() {
        const businessName = prompt('🏪 Nom de la boutique :');
        if (!businessName) return;
        
        const ownerName = prompt('👤 Nom du propriétaire :');
        if (!ownerName) return;
        
        const phone = prompt('📞 Téléphone :');
        if (!phone) return;
        
        const activity = prompt('📦 Type (small/medium/large) :');
        
        const accessKey = Math.random().toString(36).substring(2, 10).toUpperCase();
        const now = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        
        const newMerchant = {
            id: Date.now(),
            businessName: businessName,
            ownerName: ownerName,
            phone: phone,
            email: '',
            password: accessKey,
            activity: activity === 'medium' ? 'medium' : activity === 'large' ? 'large' : 'small',
            status: 'active',
            subscriptionDate: now.toISOString(),
            expiryDate: expiryDate.toISOString(),
            accessKey: accessKey,
            createdAt: now.toISOString()
        };
        
        const merchants = JSON.parse(localStorage.getItem('justemarket_merchants') || '[]');
        merchants.push(newMerchant);
        localStorage.setItem('justemarket_merchants', JSON.stringify(merchants));
        
        localStorage.setItem(`products_${accessKey}`, JSON.stringify([]));
        localStorage.setItem(`orders_${accessKey}`, JSON.stringify([]));
        
        loadMerchants();
        alert(`✅ Commerçant ajouté !\n🔑 Clé : ${accessKey}`);
    };
    
    window.clearAllData = function() {
        if (confirm('⚠️ ATTENTION : Cette action supprime TOUTES les données (commerçants, demandes, produits). Confirmer ?')) {
            localStorage.clear();
            localStorage.setItem('justemarket_merchants', JSON.stringify([]));
            localStorage.setItem('justemarket_pending_requests', JSON.stringify([]));
            alert('✅ Toutes les données ont été effacées');
            location.reload();
        }
    };
    
    loadMerchants();
    loadPendingRequests();
}

// ========== FONCTIONS UTILITAIRES ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

window.showTab = function(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const tabContent = document.getElementById(tab + 'Tab');
    if (tabContent) tabContent.classList.add('active');
    if (event && event.target) event.target.classList.add('active');
};

window.logout = function() {
    localStorage.removeItem('justemarket_current_key');
    localStorage.removeItem('justemarket_current_merchant');
    window.location.href = 'index.html';
};