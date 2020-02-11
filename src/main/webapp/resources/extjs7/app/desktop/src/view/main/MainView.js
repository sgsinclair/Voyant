Ext.define('Voyant.view.main.MainView', {
  extend: 'Ext.Container',
  xtype: 'mainview',
  controller: 'mainviewcontroller',
  viewModel: {
    type: 'mainviewmodel'
  },
  items: [
    {
      xtype: 'component',
      html: '<a style="font-size:24px" target="_blank" href="https://docs-devel.sencha.com/extjs/7.0.0-CE/guides/quick_start/What_You_Will_Be_Coding.html">Quick Start Tutorial Here</a><p>'
    },
    {
      xtype: 'displayfield',
      reference: 'df',
      bind: {
        value: '{clickTime}'
      }
    },
    {
      xtype: 'button',
      text: 'Click Me!',
      handler: 'onButtonClick'
    }
  ]
})
