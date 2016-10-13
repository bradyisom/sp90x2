import { Sp90x2Page } from './app.po';

describe('sp90x2 App', function() {
  let page: Sp90x2Page;

  beforeEach(() => {
    page = new Sp90x2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
