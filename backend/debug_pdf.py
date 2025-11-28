import pdfplumber

with pdfplumber.open('backend/uploads/test_long_2.pdf') as pdf:
    for i, page in enumerate(pdf.pages, start=1):
        text_default = page.extract_text()
        text_layout = page.extract_text(layout=True)
        print(f'--- page {i} (default) ---')
        print(repr(text_default))
        print(f'--- page {i} (layout=True) ---')
        print(repr(text_layout))

