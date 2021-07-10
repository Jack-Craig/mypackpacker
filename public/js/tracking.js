const params = new URLSearchParams(window.location.search)
window.location = params.get('url')