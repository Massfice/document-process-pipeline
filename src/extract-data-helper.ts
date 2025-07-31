import { docSchema } from './schemas/doc.schema';

const extractCustomerName = (
    data: Record<string, any>,
    content: string,
) => {
    data.customerName = content
        .replace('Customer Name:', '')
        .trim();
};

const extractCustomerEmail = (
    data: Record<string, any>,
    content: string,
) => {
    data.customerEmail = content
        .replace('Customer Email:', '')
        .trim();
};

const extractTotal = (
    data: Record<string, any>,
    content: string,
) => {
    data.total = content.replace('Total:', '').trim();
};

const extractProductName = (
    data: Record<string, any>,
    content: string,
) => {
    data.name = content.replace('Product Name:', '').trim();
};

const extractProductPrice = (
    data: Record<string, any>,
    content: string,
) => {
    data.price = content
        .replace('Product Price:', '')
        .trim();
};

const extractProductQuantity = (
    data: Record<string, any>,
    content: string,
) => {
    data.quantity = content
        .replace('Product Quantity:', '')
        .trim();
};

const extractProduct = (
    data: Record<string, any>,
    content: string,
) => {
    const productData = content.split('\n');

    const productName = productData.find((line) =>
        line.startsWith('Product Name:'),
    );

    const productPrice = productData.find((line) =>
        line.startsWith('Product Price:'),
    );

    const productQuantity = productData.find((line) =>
        line.startsWith('Product Quantity:'),
    );

    if (productName) {
        extractProductName(data, productName);
    }

    if (productPrice) {
        extractProductPrice(data, productPrice);
    }

    if (productQuantity) {
        extractProductQuantity(data, productQuantity);
    }
};

const extractProducts = (
    data: Record<string, any>,
    content: string,
) => {
    data.products = [];

    content
        .replace('Products:', '')
        .trim()
        .split('...\n')
        .forEach((productSection) => {
            const product: Record<string, any> = {};

            extractProduct(product, productSection);

            data.products.push(product);
        });
};

export const extractDataHelper = (content: string) => {
    const data: Record<string, any> = {};

    const sections = content.split('---\n');

    const customerName = sections.find((section) =>
        section.startsWith('Customer Name:'),
    );
    const customerEmail = sections.find((section) =>
        section.startsWith('Customer Email:'),
    );
    const total = sections.find((section) =>
        section.startsWith('Total:'),
    );

    if (customerName) {
        extractCustomerName(data, customerName);
    }

    if (customerEmail) {
        extractCustomerEmail(data, customerEmail);
    }

    if (total) {
        extractTotal(data, total);
    }

    const products = sections.find((section) =>
        section.startsWith('Products:'),
    );

    if (products) {
        extractProducts(data, products);
    }

    return data;
};

export const validateDataHelper = (
    data: Record<string, any>,
) => {
    const result = docSchema.safeParse(data);

    if (!result.success) {
        return result.success;
    }

    return result.data;
};
