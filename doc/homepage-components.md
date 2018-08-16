# Homepage Components

Apps based on this framework allow multiple configurable components on the home and story page. The catalog of all possible components is exposed as a JSON API, which in turn powers the drop down in the Editor's pages screens.

In order to add a new component,
* Add the component to `app/isomorphic/components/collection-templates/index.js`
* Edit `config/template-options.yml` and add the name of the component. Also, you may specify any properties the user can configure.
* Deploy your changes to staging or production (and ensure the editor is configured correctly to point to your instance)
* The new template should appear in the dropdown (allow 5 minutes for caching)
