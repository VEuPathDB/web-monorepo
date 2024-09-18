import { jsxs as _jsxs, jsx as _jsx } from 'react/jsx-runtime';
export function DateTime(props) {
  var _a;
  try {
    const dateObj = new Date(props.datetime);
    const isoString = dateObj.toISOString();
    const [_, date = 'Unknown', time = ''] =
      (_a = dateObj
        .toISOString()
        .match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}).*/)) !== null && _a !== void 0
        ? _a
        : [];
    return _jsxs(
      'div',
      Object.assign({ title: isoString }, { children: [date, ' ', time] })
    );
  } catch (_b) {
    return _jsx('div', { children: 'Unknown' });
  }
}
//# sourceMappingURL=DateTime.js.map
