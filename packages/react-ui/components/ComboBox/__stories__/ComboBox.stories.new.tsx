import React from 'react';
import { WebDriver } from 'selenium-webdriver';
import { expect } from 'chai';

import { ComboBox, ComboBoxProps } from '../ComboBox';
import { delay } from '../../../lib/utils';

// eslint-disable-next-line import/no-default-export
export default {
  title: 'ComboBox',
};

export const SimpleCombobox = () => {
  const getItems = (q: string) =>
    Promise.resolve(
      [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
      ].filter(item => item.label.toLowerCase().startsWith(q.toLowerCase())),
    );

  return (
    <div style={{ paddingBottom: 230, paddingRight: 40 }}>
      <ComboBox placeholder="ComboBox" getItems={getItems} />
    </div>
  );
};

SimpleCombobox.story = {
  parameters: {
    creevey: {
      tests: {
        async playground(this: { browser: WebDriver }) {
          const element = await this.browser.findElement({ css: '#test-element' });
          const input = await this.browser.findElement({ css: '[data-comp-name="InputLikeText"]' });

          const idle = await element.takeScreenshot();

          // await expect(idle).to.matchImage();

          await this.browser
            .actions({ bridge: true })
            .click(input)
            .perform();

          const opened = await element.takeScreenshot();

          await this.browser
            .actions({ bridge: true })
            .sendKeys('T')
            .perform();

          await delay(500);

          const query = await element.takeScreenshot();

          await this.browser
            .actions({ bridge: true })
            .sendKeys('\uE007')
            .perform();

          await delay(500);

          const selected = await element.takeScreenshot();

          await expect({ idle, opened, query, selected }).to.matchImages();
        },
      },
    },
  },
};
