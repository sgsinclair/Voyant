Ext.define('Voyant.data.model.AnalysisToken', {
    extend: 'Ext.data.Model',
    idProperty: 'term',
    fields: [
         {name: 'term'},
         {name: 'rawFreq', type: 'int'},
         {name: 'relativeFreq', type: 'number'},
         {name: 'cluster', type: 'int'},
         {name: 'clusterCenter', type: 'boolean'},
         {name: 'vector'}
    ]
});