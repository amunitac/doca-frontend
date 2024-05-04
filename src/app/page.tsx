'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Order {
  productId: string;
  quantity: number;
}

interface Account {
  id: number;
  name: string;
  orders: Order[];
}

export default function Home() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [selectedProductQuantity, setSelectedProductQuantity] = useState(1);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch products from the server
  useEffect(() => {
    axios
      .get(
        'https://script.google.com/macros/s/AKfycbx8pgvpLBRI_GU1X2tNxkqD_JzyuX4lAcv84VlKh31lfihcBpklR7kljsjOV-HMwMfs/exec',
      )
      .then((response) => {
        const productsList: Product[] = response.data.map((product: any) => ({
          id: product['CODIGO'],
          name: product['PRODUCTO'],
          price: product['PRECIO VENTA'],
        }));
        setProducts(productsList);
      });
  }, []);

  // Fetch accounts from the server
  useEffect(() => {
    axios
      .get(
        'https://script.google.com/macros/s/AKfycbyH2R2W-cyXvWWQbNOK1fPdlqhbUiracR9i8FNA0A2lwoO1cf2Hni0zgWQWheq62tY/exec',
      )
      .then((response) => {
        const accountsList: Account[] = response.data.map((account: any) => ({
          id: account['id'],
          name: account['name'],
          orders: account['orders'],
        }));
        setAccounts(accountsList);
      });
  }, []);

  const handleAddProduct = (accountId: number) => {
    if (selectedProductId !== null) {
      const accountIndex = accounts.findIndex(
        (account) => account.id === accountId,
      );
      if (accountIndex !== -1) {
        const newAccounts = [...accounts];
        const existingOrderIndex = newAccounts[accountIndex].orders.findIndex(
          (order) => order.productId === selectedProductId,
        );
        if (existingOrderIndex !== -1) {
          newAccounts[accountIndex].orders[existingOrderIndex].quantity +=
            selectedProductQuantity;
        } else {
          newAccounts[accountIndex].orders.push({
            productId: selectedProductId,
            quantity: selectedProductQuantity,
          });
        }
        setAccounts(newAccounts);
        setSelectedProductId(null);
        setSelectedProductQuantity(1);
      }
    }
  };

  const handleRemoveProduct = (
    accountId: number,
    productId: string,
    quantityToRemove: number,
  ) => {
    const accountIndex = accounts.findIndex(
      (account) => account.id === accountId,
    );
    if (accountIndex !== -1) {
      const newAccounts = [...accounts];
      const orderIndex = newAccounts[accountIndex].orders.findIndex(
        (order) => order.productId === productId,
      );
      if (orderIndex !== -1) {
        if (
          quantityToRemove >=
          newAccounts[accountIndex].orders[orderIndex].quantity
        ) {
          // If quantity to remove is greater or equal to the current quantity, remove the entire order
          newAccounts[accountIndex].orders.splice(orderIndex, 1);
        } else {
          // Otherwise, subtract the specified quantity from the current quantity
          newAccounts[accountIndex].orders[orderIndex].quantity -=
            quantityToRemove;
        }
        setAccounts(newAccounts);
      }
    }
  };

  const handleCloseAccount = (accountId: number) => {
    const updatedAccounts = accounts.filter(
      (account) => account.id !== accountId,
    );
    setAccounts(updatedAccounts);
  };

  const handleOpenNewTable = () => {
    const newTableId = accounts.length + 1;
    setAccounts([
      ...accounts,
      { id: newTableId, name: `Table ${newTableId}`, orders: [] },
    ]);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Open Tables</h1>
      <button
        onClick={handleOpenNewTable}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Open New Table
      </button>
      {accounts.map((account) => (
        <div key={account.id} className="mb-4">
          <h2 className="text-lg font-semibold">{account.name}</h2>
          <div className="mb-2">
            <select
              value={selectedProductId ?? ''}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="mr-2 px-2 py-1 border rounded"
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (${product.price})
                </option>
              ))}
            </select>
            <input
              type="number"
              value={selectedProductQuantity}
              onChange={(e) =>
                setSelectedProductQuantity(parseInt(e.target.value))
              }
              min="1"
              className="px-2 py-1 border rounded"
            />
            <button
              onClick={() => handleAddProduct(account.id)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded ml-2"
            >
              Add Product
            </button>
            <button
              onClick={() => handleCloseAccount(account.id)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2"
            >
              Close Table
            </button>
          </div>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border">Product</th>
                <th className="border">Price</th>
                <th className="border">Quantity</th>
                <th className="border"></th>
              </tr>
            </thead>
            <tbody>
              {account.orders.map((order) => {
                const product = products.find(
                  (product) => product.id === order.productId,
                );
                return (
                  <tr key={order.productId} className="bg-white">
                    <td className="border">{product?.name}</td>
                    <td className="border">${product?.price}</td>
                    <td className="border">{order.quantity}</td>
                    <td className="border">
                      <div className="flex">
                        <input
                          type="number"
                          min="1"
                          max={order.quantity}
                          defaultValue="1"
                          className="px-2 py-1 border rounded mr-2 w-16"
                          onChange={(e) =>
                            setSelectedProductQuantity(parseInt(e.target.value))
                          }
                        />
                        <button
                          onClick={() =>
                            handleRemoveProduct(
                              account.id,
                              order.productId,
                              selectedProductQuantity,
                            )
                          }
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
