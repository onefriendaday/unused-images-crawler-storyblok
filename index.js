// BEGIN: Configuration

const oauthToken = 'YOUR_OAUTH_TOKEN'
const spaceId = YOUR_SPACE_ID
const folderToAssign = YOUR_FOLDER_ID

// END: Configuration


const StoryblokClient = require('storyblok-js-client')

const Storyblok = new StoryblokClient({
  oauthToken: oauthToken
})

let filenames = []

const Sync = {
  _getAll(type, page) {
    console.log(`Getting page ${page} of ${type}`)
    return Storyblok.get(`spaces/${spaceId}/${type}`, {
      per_page: 100,
      story_only: 1,
      page: page,
      with_alts: 1
    })
  },

  async getAll(type) {
    var page = 1
    var res = await this._getAll(type, page)
    var all = res.data[type]
    var total = res.total
    var lastPage = Math.ceil((res.total / 100))

    while (page < lastPage){
      page++
      res = await this._getAll(type, page)
      res.data[type].forEach((story) => {
        all.push(story)
      })
    }
    return all
  },

  traverse(tree) {
    let traverse = function(jtree) {
      if (jtree.constructor === Array) {
        for (var item = 0; item < jtree.length; item++) {
          traverse(jtree[item])
        }
      } else if (jtree.constructor === Object) {
        for (var treeItem in jtree) {
          traverse(jtree[treeItem])
        }
      } else if (jtree.constructor === String) {
        let idx = filenames.indexOf(jtree)
        if (idx > -1) {
          console.log(`${jtree} found`)
          filenames.splice(idx, 1)
        }
      }
    }

    traverse(tree)
    return tree
  },

  async processAllStories() {
    let stories = await this.getAll('stories')
    let assets = await this.getAll('assets')
    filenames = assets.map((item) => { return item.filename.replace('https://s3.amazonaws.com/', '//') })

    for (var i = 0; i < stories.length; i++) {
      let res = await Storyblok.get(`spaces/${spaceId}/stories/${stories[i].id}`)
      console.log(`Searching in ${res.data.story.full_slug}`)
      this.traverse(res.data.story.content)
    }

    for (var j = 0; j < filenames.length; j++) {
      let asset = assets.filter((item) => {
        return item.filename.replace('https://s3.amazonaws.com/', '//') == filenames[j]
      })
      await Storyblok.put(`spaces/${spaceId}/assets/${asset[0].id}`, {
        asset: {asset_folder_id: folderToAssign}
      })
      console.log(`Asset ${asset[0].id} moved to folder ${folderToAssign}`)
    }

    return stories
  }
}

Sync.processAllStories()