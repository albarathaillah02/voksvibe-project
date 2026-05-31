import { page } from '../../config/page';

export default function Csrf() {
    return <input type="hidden" name="_token" value={page.csrfToken} />;
}
