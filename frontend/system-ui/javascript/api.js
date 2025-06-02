// Função para fazer a requisição de criar um novo produto
async function createProduct(data) {
    try {
        const response = await fetch('https://seu-endereco-da-api.com/criar-produto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            throw new Error('Erro ao criar o produto');
        }

        const result = await response.json();
        console.log('Produto criado com sucesso:', result);
        return result;
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Função para pegar todos os produtos
async function getAllProducts() {
    try {
        const response = await fetch('https://seu-endereco-da-api.com/produtos', {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar os produtos');
        }

        const products = await response.json();
        console.log('Produtos carregados:', products);
        return products;
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Função para atualizar um produto
async function updateProduct(id, data) {
    try {
        const response = await fetch(`https://seu-endereco-da-api.com/atualizar-produto/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar o produto');
        }

        const result = await response.json();
        console.log('Produto atualizado com sucesso:', result);
        return result;
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Função para deletar um produto
async function deleteProduct(id) {
    try {
        const response = await fetch(`https://seu-endereco-da-api.com/deletar-produto/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Erro ao deletar o produto');
        }

        const result = await response.json();
        console.log('Produto deletado com sucesso:', result);
        return result;
    } catch (error) {
        console.error('Erro:', error);
    }
}