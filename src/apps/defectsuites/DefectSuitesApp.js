(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.defectsuites.DefectSuitesApp', {
        extend: 'Rally.app.GridBoardApp',
        requires: [
            'Rally.data.Ranker',
            'Rally.ui.gridboard.plugin.GridBoardInlineFilterControl',
            'Rally.ui.gridboard.plugin.GridBoardSharedViewControl'
        ],

        columnNames: ['Name','State','Priority','Severity','Owner'],
        enableXmlExport: true,
        modelNames: ['DefectSuite'],
        statePrefix: 'defectsuites',

        getAddNewConfig: function () {
            return _.merge(this.callParent(arguments), {margin: 0});
        },

        getGridBoardConfig: function () {
            var config = this.callParent(arguments);
            return _.merge(config, {
                listeners: {
                    viewchange: function() {
                        this.loadGridBoard();
                    },
                    scope: this
                }
            });
        },

        getGridBoardCustomFilterControlConfig: function () {
            var context = this.getContext();
            var blackListFields = ['ModelType'];
            var whiteListFields = ['Milestones', 'Tags'];

            return {
                ptype: 'rallygridboardinlinefiltercontrol',
                inlineFilterButtonConfig: {
                    stateful: true,
                    stateId: context.getScopedStateId('defect-suites-inline-filter'),
                    legacyStateIds: [
                        this.getScopedStateId('owner-filter'),
                        this.getScopedStateId('custom-filter-button')
                    ],
                    filterChildren: true,
                    modelNames: this.modelNames,
                    inlineFilterPanelConfig: {
                        quickFilterPanelConfig: {
                            defaultFields: [
                                'ArtifactSearch',
                                'Owner'
                            ],
                            addQuickFilterConfig: {
                                blackListFields: blackListFields,
                                whiteListFields: whiteListFields
                            }
                        },
                        advancedFilterPanelConfig: {
                            advancedFilterRowsConfig: {
                                propertyFieldConfig: {
                                    blackListFields: blackListFields,
                                    whiteListFields: whiteListFields
                                }
                            }
                        }
                    }
                }
            };
        },

        getSharedViewConfig: function() {
            var context = this.getContext();
            return {
                ptype: 'rallygridboardsharedviewcontrol',
                sharedViewConfig: {
                    stateful: true,
                    stateId: context.getScopedStateId('defect-suites-shared-view'),
                    defaultViews: _.map(this._getDefaultViews(), function(view) {
                        Ext.apply(view, {
                            Value: Ext.JSON.encode(view.Value, true)
                        });
                        return view;
                    }, this),
                    enableUrlSharing: this.isFullPageApp !== false
                }
            };

        },

        _getDefaultViews: function() {
            var rankColumnDataIndex = this.getContext().getWorkspace().WorkspaceConfiguration.DragDropRankingEnabled ? Rally.data.Ranker.RANK_FIELDS.DND : Rally.data.Ranker.RANK_FIELDS.MANUAL;

            return [
                {
                    Name: 'Default View',
                    identifier: 1,
                    Value: {
                        toggleState: 'grid',
                        columns: _.flatten([
                            { dataIndex: rankColumnDataIndex },
                            _.map(this.columnNames, function(columnName) {
                                return { dataIndex: columnName };
                            })
                        ]),
                        sorters:[{ property: rankColumnDataIndex, direction: 'ASC' }]
                    }
                }
            ];
        }
    });
})();