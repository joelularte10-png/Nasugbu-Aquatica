(function () {
    'use strict';

    var storageKey = 'nasugbu-aquatica-inventory';
    var defaultItems = [
        { id: 'guppy', name: 'Guppy', type: 'Livebearer', stock: 30, price: 35, reorderPoint: 10, color: 'guppy', icon: 'G' },
        { id: 'betta', name: 'Betta', type: 'Labyrinth fish', stock: 15, price: 120, reorderPoint: 10, color: 'betta', icon: 'B' },
        { id: 'goldfish', name: 'Goldfish', type: 'Coldwater fish', stock: 20, price: 80, reorderPoint: 10, color: 'goldfish', icon: 'G' },
        { id: 'tetra', name: 'Neon Tetra', type: 'Community fish', stock: 5, price: 45, reorderPoint: 10, color: 'tetra', icon: 'N' }
    ];

    var items = loadItems();
    var tableBody = document.getElementById('inventory-body');
    var form = document.getElementById('inventory-form');
    var modalElement = document.getElementById('inventory-modal');
    var modal = bootstrap.Modal.getOrCreateInstance(modalElement);

    function loadItems() {
        try {
            var storedItems = JSON.parse(localStorage.getItem(storageKey));
            return Array.isArray(storedItems) ? storedItems : defaultItems.slice();
        } catch (error) {
            return defaultItems.slice();
        }
    }

    function saveItems() {
        localStorage.setItem(storageKey, JSON.stringify(items));
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character];
        });
    }

    function getStatus(item) {
        if (item.stock === 0) {
            return { key: 'out', label: 'Out of stock', className: 'status-out' };
        }
        if (item.stock <= item.reorderPoint) {
            return { key: 'low', label: 'Low stock', className: 'status-low' };
        }
        return { key: 'available', label: 'Available', className: 'status-available' };
    }

    function render() {
        var query = document.getElementById('inventory-search').value.trim().toLowerCase();
        var statusFilter = document.getElementById('status-filter').value;
        var visibleItems = items.filter(function (item) {
            var matchesQuery = !query || (item.name + ' ' + item.type).toLowerCase().indexOf(query) !== -1;
            return matchesQuery && (statusFilter === 'all' || getStatus(item).key === statusFilter);
        });

        tableBody.innerHTML = visibleItems.map(function (item) {
            var status = getStatus(item);
            return '<tr>' +
                '<td><div class="fish-name"><span class="fish-avatar ' + escapeHtml(item.color) + '">' + escapeHtml(item.icon) + '</span><strong>' + escapeHtml(item.name) + '</strong></div></td>' +
                '<td>' + escapeHtml(item.type) + '</td>' +
                '<td><strong>' + item.stock + '</strong><small class="stock-threshold">Reorder at ' + item.reorderPoint + '</small></td>' +
                '<td>₱' + Number(item.price).toFixed(2) + '</td>' +
                '<td><span class="stock-status ' + status.className + '">' + status.label + '</span></td>' +
                '<td class="text-end text-nowrap"><button class="btn btn-sm btn-outline-secondary edit-item" data-id="' + escapeHtml(item.id) + '">Edit</button> <button class="btn btn-sm btn-outline-danger delete-item" data-id="' + escapeHtml(item.id) + '">Delete</button></td>' +
                '</tr>';
        }).join('');

        document.getElementById('empty-state').classList.toggle('d-none', visibleItems.length !== 0);
        document.getElementById('visible-count').textContent = visibleItems.length + (visibleItems.length === 1 ? ' item' : ' items');
        document.getElementById('variety-count').textContent = items.length;
        document.getElementById('stock-count').textContent = items.reduce(function (total, item) { return total + item.stock; }, 0);
        var attentionCount = items.filter(function (item) { return getStatus(item).key !== 'available'; }).length;
        document.getElementById('attention-count').textContent = attentionCount + (attentionCount === 1 ? ' variety' : ' varieties');
    }

    function resetForm() {
        form.reset();
        document.getElementById('item-id').value = '';
        document.getElementById('inventory-modal-title').textContent = 'Add inventory item';
        document.getElementById('form-error').classList.add('d-none');
    }

    function editItem(item) {
        document.getElementById('item-id').value = item.id;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-type').value = item.type;
        document.getElementById('item-stock').value = item.stock;
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-reorder').value = item.reorderPoint;
        document.getElementById('inventory-modal-title').textContent = 'Edit inventory item';
        document.getElementById('form-error').classList.add('d-none');
        modal.show();
    }

    document.getElementById('add-item-btn').addEventListener('click', resetForm);
    document.getElementById('inventory-search').addEventListener('input', render);
    document.getElementById('status-filter').addEventListener('change', render);

    tableBody.addEventListener('click', function (event) {
        var button = event.target.closest('button');
        if (!button) return;
        var item = items.find(function (entry) { return entry.id === button.dataset.id; });
        if (!item) return;
        if (button.classList.contains('edit-item')) {
            editItem(item);
        } else if (button.classList.contains('delete-item') && window.confirm('Delete ' + item.name + ' from inventory?')) {
            items = items.filter(function (entry) { return entry.id !== item.id; });
            saveItems();
            render();
        }
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var id = document.getElementById('item-id').value;
        var name = document.getElementById('item-name').value.trim();
        var type = document.getElementById('item-type').value.trim();
        var stock = Number(document.getElementById('item-stock').value);
        var price = Number(document.getElementById('item-price').value);
        var reorderPoint = Number(document.getElementById('item-reorder').value);
        var error = document.getElementById('form-error');

        if (!name || !type || !Number.isInteger(stock) || stock < 0 || !Number.isFinite(price) || price < 0 || !Number.isInteger(reorderPoint) || reorderPoint < 0) {
            error.textContent = 'Enter valid values. Stock and threshold must be whole numbers equal to or above zero.';
            error.classList.remove('d-none');
            return;
        }
        if (items.some(function (item) { return item.name.toLowerCase() === name.toLowerCase() && item.id !== id; })) {
            error.textContent = 'An item with this product name already exists.';
            error.classList.remove('d-none');
            return;
        }

        if (id) {
            var existing = items.find(function (item) { return item.id === id; });
            Object.assign(existing, { name: name, type: type, stock: stock, price: price, reorderPoint: reorderPoint });
        } else {
            items.push({ id: Date.now().toString(), name: name, type: type, stock: stock, price: price, reorderPoint: reorderPoint, color: 'aqua', icon: name.charAt(0).toUpperCase() });
        }
        saveItems();
        render();
        modal.hide();
    });

    render();
}());
