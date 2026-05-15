import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    categoryId: 1,
    description: ''
  });

  // Lấy token từ localStorage
  const token = localStorage.getItem('token');

  // Cấu hình axios với token
  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  // Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/Product', axiosConfig);
      setProducts(response.data);
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm:', error);
      alert('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Xử lý thêm/sửa sản phẩm
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Cập nhật sản phẩm
        await axios.put(`http://localhost:5001/api/Product/${editingProduct.id}`, formData, axiosConfig);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        // Thêm sản phẩm mới
        await axios.post('http://localhost:5001/api/Product', formData, axiosConfig);
        alert('Thêm sản phẩm thành công!');
      }
      
      // Reset form và tải lại danh sách
      setFormData({ name: '', price: '', stock: '', categoryId: 1, description: '' });
      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
      
    } catch (error) {
      console.error('Lỗi:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Xóa sản phẩm
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await axios.delete(`http://localhost:5001/api/Product/${id}`, axiosConfig);
        alert('Xóa sản phẩm thành công!');
        fetchProducts();
      } catch (error) {
        console.error('Lỗi khi xóa:', error);
        alert('Không thể xóa sản phẩm');
      }
    }
  };

  // Sửa sản phẩm
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      description: product.description || ''
    });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Quản lý Sản phẩm</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', price: '', stock: '', categoryId: 1, description: '' });
            setShowForm(!showForm);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Đóng form' : '+ Thêm sản phẩm'}
        </button>
      </div>

      {/* Form thêm/sửa sản phẩm */}
      {showForm && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h3>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                name="name"
                placeholder="Tên sản phẩm"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="number"
                name="price"
                placeholder="Giá"
                value={formData.price}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="number"
                name="stock"
                placeholder="Số lượng tồn"
                value={formData.stock}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <textarea
                name="description"
                placeholder="Mô tả"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {editingProduct ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </form>
        </div>
      )}

      {/* Bảng danh sách sản phẩm */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Tên sản phẩm</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Giá</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Tồn kho</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Mô tả</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{product.id}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{product.name}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{product.stock}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{product.description}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => handleEdit(product)}
                    style={{
                      marginRight: '5px',
                      padding: '5px 10px',
                      backgroundColor: '#ffc107',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductList;