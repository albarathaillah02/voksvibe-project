import { page } from '../../config/page';
import { orderStatuses } from '../../constants/orders';
import { formatRupiah } from '../../utils/format';
import Csrf from '../forms/Csrf';
import MethodInput from '../forms/MethodInput';

export default function OrderTable({ orders, onSaveStatus }) {
    return (
        <div className="table-wrap">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Kode</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Items</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.order_code}</td>
                            <td>
                                {order.user?.name}
                                <br />
                                <small>{order.user?.email}</small>
                            </td>
                            <td>{formatRupiah(order.total_amount)}</td>
                            <td>
                                {/* Form dipertahankan agar jika onSaveStatus tidak dikirim/gagal, 
                                  struktur request bawaan Laravel (CSRF & PATCH) tetap aman.
                                */}
                                <form 
                                    method="POST" 
                                    action={`${page.routes.adminOrdersBase}/${order.id}`} 
                                    className="cart-inline-form"
                                    onSubmit={(e) => {
                                        if (onSaveStatus) {
                                            onSaveStatus(e, order.id);
                                        }
                                    }}
                                >
                                    <Csrf />
                                    <MethodInput method="PATCH" />
                                    
                                    <select name="status" defaultValue={order.status}>
                                        {orderStatuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {/* 🟢 FIX: Menggunakan type="button" (bukan submit) jika handler React aktif,
                                      atau menggunakan onSubmit handler pada form untuk mematikan scroll kaget.
                                    */}
                                    <button 
                                        type="button" 
                                        className="chip-button"
                                        onClick={(e) => {
                                            if (onSaveStatus) {
                                                onSaveStatus(e, order.id);
                                            } else {
                                                e.target.closest('form').submit();
                                            }
                                        }}
                                    >
                                        Simpan
                                    </button>
                                </form>
                            </td>
                            <td>
                                {order.items.map((item) => (
                                    <div key={item.id}>
                                        {item.product_name} x{item.quantity}
                                    </div>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}