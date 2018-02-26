// @todo there should be an inherit schema option. so u can inherit a base resource schema but do
// ur own shit. child schemas cant override parent schema rules.
module.exports = () => {
  var envSchema = createSchema(0, 1, 2);
  var fieldSchema = createSchema(0);
  envSchema(0).validate.each.key((key, value, {apps}) => {
    return {
      error: Object.keys(apps).indexOf(key) > -1 ? null : 'invalid appname', // validate w/ error
      value: undefined, // transform
    };
  });
  envSchema(1).validate.all.keys(keys => {
    return {
      error: keys.indexOf('local') > -1 ? null : 'must include local',
    }
  });
  envSchema(2).validate.required.keys('port');
  fieldSchema.transform.each.value(value => {
    return value === 'object' ? value : { value };
  });
  fieldSchema.assign.default.values({overwrite: true, refresh: true})
  fieldSchema.validate.all.values.by.type({
     allows: ['object', 'string'],
     error(value, type) {
       return 'expected object or string';
     },
  })
  fieldSchema.validate.fields({
   value: {
     required() {
       return 'this is the error';
     },
     transform(value) {}
   },
   refresh: {
    type: {
      allows: ['boolean'],
      error() {

      }
    }
   }
  });
  fieldSchema.require.keys(['value', 'refresh', 'overwrite']);
  fieldSchema.validate.every.field(schema {
    required() {}, // required will never be called if we only itterate over the fields they give us.
    // @todo, need an actual schema.
  });
  envSchema.attachSchema(fieldSchema);
  return envSchema;
};

// obj verb ?
// schemaObj.[validate|assign|require]



module.exports = createSchema({
  depth: 0,
  deferred: {
    keys: {
      each(key, value, {apps}) {
        return {
          error: Object.keys(apps).indexOf(key) > -1 ? null : 'invalid appname', // validate w/ error
          value: undefined, // transform
        };
      },
    },
  },
},
{
  depth: 1,
  keys: {
    all(keys) {
      return {
        error: keys.indexOf('local') > -1 ? null : 'must include local',
      }
    }
  }
},
{
  depth: 2,
  keys: {
    required: ['port'],
  },
  values: {
   schema: createSchema({
     depth: 0, // default
     values: {
       inherits: {overwrite: true, refresh: true},
       type: {
         allows: ['object', 'string'],
         error(value, type) {
           return 'expected object or string';
         },
       }
     },
     fields: {
       value: {
         required() {
           return 'this is the error';
         },
         transform(value) {
            return value === 'object' ? value : { value };
         }
       },
       refresh: {

       }
     }
   }),
  },
});
