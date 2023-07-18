---
---
{% raw %}
$(document).ready(function () {
  var searchTerm = new URLSearchParams(window.location.search).get('q');
  if (searchTerm) {
    $('#search-input').val(searchTerm);
    performSearch(searchTerm);
  }

  $('#search-input').on('input', function () {
    var query = $(this).val();
    performSearch(query);
  });

  function performSearch(query) {
    var index = lunr(function () {
      this.field('title');
      this.field('content');
      // Add more fields as needed
      {% for post in site.posts %}
      this.add({
        'id': '{{ post.id }}',
        'title': '{{ post.title | escape }}',
        'content': '{{ post.content | strip_html | strip_newlines | remove: '"' | escape }}'
      });
      {% endfor %}
    });

    var results = index.search(query);
    var $searchResults = $('#search-results');
    $searchResults.empty();

    if (results.length > 0) {
      $.each(results, function (index, result) {
        var item = '<li><a href="{{ site.baseurl }}{{ result.ref }}">{{ result.doc.title }}</a></li>';
        $searchResults.append(item);
      });
    } else {
      $searchResults.append('<li>No results found.</li>');
    }
  }
});
{% endraw %}
