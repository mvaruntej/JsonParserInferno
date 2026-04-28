function decodeJwt() {
  var text = document.getElementById('input').value.trim();
  try {
    var parts = text.split('.');
    if (parts.length < 2) throw new Error('JWT must contain at least header and payload sections.');
    var header = parseJwtPart(parts[0]);
    var payload = parseJwtPart(parts[1]);
    document.getElementById('jwtOutput').textContent = JSON.stringify({
      header: header,
      payload: payload,
      signaturePresent: !!parts[2]
    }, null, getIndent());
    setStatus('JWT decoded locally', 'valid');
    showTab('jwt');
  } catch (e) {
    document.getElementById('jwtOutput').textContent = 'Could not decode JWT:\n' + e.message;
    setStatus('JWT decode failed: ' + e.message, 'invalid');
    showTab('jwt');
  }
}

function parseJwtPart(value) {
  return JSON.parse(base64UrlDecode(value));
}

function base64UrlDecode(value) {
  var normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  while (normalized.length % 4) normalized += '=';
  try {
    return decodeURIComponent(Array.prototype.map.call(atob(normalized), function(char) {
      return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    return atob(normalized);
  }
}
