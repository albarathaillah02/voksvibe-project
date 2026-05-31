export default function MethodInput({ method }) {
    return method ? <input type="hidden" name="_method" value={method} /> : null;
}
