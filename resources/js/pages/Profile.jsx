import { page } from '../config/page';
import { oldValue } from '../utils/oldValue';
import Banner from '../components/ui/Banner';
import Csrf from '../components/forms/Csrf';
import MethodInput from '../components/forms/MethodInput';
import Field from '../components/forms/Field';
import SummaryLine from '../components/ui/SummaryLine';

export default function Profile({ user }) {
    return (
        <>
            <Banner mode="dark" eyebrow="Account Center" title="PROFIL" copy="Kelola identitas akun, kontak, dan alamat utama untuk checkout berikutnya." />
            <section className="section-block two-column">
                <form method="POST" action={page.routes.profileUpdate} className="panel-card stack">
                    <Csrf />
                    <MethodInput method="PUT" />
                    <div className="form-grid">
                        <Field label="Nama Lengkap"><input type="text" name="name" defaultValue={oldValue('name', user.name)} required /></Field>
                        <Field label="Username"><input type="text" name="username" defaultValue={oldValue('username', user.username)} required /></Field>
                        <Field label="Email"><input type="email" name="email" defaultValue={oldValue('email', user.email)} required /></Field>
                        <Field label="Telepon"><input type="text" name="phone" defaultValue={oldValue('phone', user.phone)} /></Field>
                        <Field label="Gender">
                            <select name="gender" required defaultValue={oldValue('gender', user.gender)}>
                                <option value="unspecified">Unspecified</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </Field>
                        <Field label="Tanggal Lahir"><input type="date" name="birth_date" defaultValue={oldValue('birth_date', user.birth_date?.slice(0, 10))} /></Field>
                    </div>
                    <Field label="Alamat"><textarea name="address" rows="4" defaultValue={oldValue('address', user.address)} /></Field>
                    <div className="form-grid"></div>
                    <button type="submit" className="action-button action-button--dark">Simpan Profil</button>
                </form>
                <aside className="summary-card">
                    <p className="eyebrow">Quick Access</p>
                    <h2>{user.name}</h2>
                    <SummaryLine label="Role" value={user.role?.toUpperCase()} />
                    <SummaryLine label="Email" value={user.email} />
                    <a href={page.routes.orders} className="action-button">Lihat Pesanan</a>
                    {page.auth.isAdmin && <a href={page.routes.admin} className="action-button action-button--dark">Buka Admin</a>}
                </aside>
            </section>
        </>
    );
}
