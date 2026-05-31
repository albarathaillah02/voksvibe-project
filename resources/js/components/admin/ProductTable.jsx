import { page } from '../../config/page';
import { formatRupiah } from '../../utils/format';
import Csrf from '../forms/Csrf';
import MethodInput from '../forms/MethodInput';

export default function ProductTable({ products }) {
    return (
        <div className="table-wrap">
            <table className="data-table">
                <thead>
                    <tr><th>Produk</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.category}</td>
                            <td>{formatRupiah(product.price)}</td>
                            <td>{product.stock}</td>
                            <td>
                                <div className="table-actions">
                                    <a href={`${page.routes.admin}?edit=${product.id}`} className="chip-button">Edit</a>
                                    <form method="POST" action={`${page.routes.adminProductsBase}/${product.id}`}>
                                        <Csrf />
                                        <MethodInput method="DELETE" />
                                        <button type="submit" className="chip-button chip-button--danger">Hapus</button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
