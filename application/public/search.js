console.log('Search.js loaded');
function searchApp() {
  console.log('searchApp function called');
  
  return {
    // Initialize all Alpine.js variables
    selectedCategory: '',
    searchQuery: '',
    categories: [],
    loading: false,
    
    // Initialize component
    init() {
      console.log('Alpine component initialized');
      this.fetchCategories();
      
      // Check URL parameters
      const params = new URLSearchParams(window.location.search);
      this.selectedCategory = params.get('category') || '';
      this.searchQuery = params.get('query') || '';
      
      // Watch for category changes and update results accordingly
      this.$watch('selectedCategory', (value) => {
        console.log('Category changed to:', value);
        // Only perform search automatically if we're on the results page
        if (window.location.pathname.includes('/results')) {
          this.performSearch();
        }
      });
    },
    
    // Fetch categories from API
    fetchCategories() {
      console.log('Fetching categories...');
      fetch('/api/categories')
        .then(response => response.json())
        .then(data => {
          console.log('Categories loaded:', data);
          this.categories = data;
        })
        .catch(error => {
          console.error('Error fetching categories:', error);
        });
    },
    
    // Search listings
    performSearch() {
      console.log('Performing search...');
      this.loading = true;

      // Prevent searching if what is in the search bar is longer than 40 characters
      if (this.searchQuery.length > 40) {
        console.error("performSearch(): Search term is too long");
        this.loading = false;
        return;
      }

      // Prevent searching if there is a non-alphanumeric character
      const alphaNumberRegex = /^[a-zA-Z0-9 ]*$/;
      if (!alphaNumberRegex.test(this.searchQuery)) {
        console.error("performSearch(): Non-alphanumeric character present");
        this.loading = false;
        return;
      }
      
      // Store search parameters
      const searchParams = {
        category: this.selectedCategory,
        query: this.searchQuery,
        timestamp: new Date().getTime()
      };
      
      localStorage.setItem('swiftThriftSearchParams', JSON.stringify(searchParams));
      
      // Update URL without page refresh
      const params = new URLSearchParams();
      if (this.selectedCategory) params.set('category', this.selectedCategory);
      if (this.searchQuery) params.set('query', this.searchQuery);
      
      const newUrl = '/results' + 
          (params.toString() ? '?' + params.toString() : '');
      
      // If on results page, fetch new results 
      if (window.location.pathname.includes('/results')) {
        console.log('Search params - Category:', this.selectedCategory, 'Query:', this.searchQuery);
        
        // Update browser history without reloading
        window.history.pushState({}, '', newUrl);
        
        fetch(`/api/listings/search?category=${encodeURIComponent(this.selectedCategory)}&query=${encodeURIComponent(this.searchQuery)}`)
          .then(response => response.json())
          .then(data => {
            console.log('Search results received:', data);
            // Broadcast an event that the results page can listen for
            window.dispatchEvent(new CustomEvent('search-results-updated', { 
              detail: { 
                listings: data.listings || [],
                count: data.count || 0,
                query: this.searchQuery,
                category: this.selectedCategory 
              } 
            }));
            this.loading = false;
          })
          .catch(error => {
            console.error('Error searching listings:', error);
            this.loading = false;
          });
      } else {
        // Navigate to results page if not already there
        console.log('Navigating to results page');
        window.location.href = newUrl;
      }
    }
  };
}

function searchResultsApp() {
  return {
    selectedCategory: '',
    searchQuery: '',
    categories: [],
    listings: [],
    resultsCount: 0,
    hasSearched: false,
    loading: true,
    
    init() {
      console.log('Search results page initialized');
      this.fetchCategories();
      this.loadSearchParams();
      
      // Listen for search updates from header
      window.addEventListener('search-results-updated', (event) => {
        console.log('Received search-results-updated event:', event.detail);
        const { listings, count, query, category } = event.detail;
        this.listings = listings;
        this.resultsCount = count;
        this.searchQuery = query;
        this.selectedCategory = category;
        this.hasSearched = true;
        this.loading = false;
      });
    },
    
    fetchCategories() {
      fetch('/api/categories')
        .then(response => response.json())
        .then(data => {
          this.categories = data;
        })
        .catch(error => {
          console.error('Error fetching categories:', error);
        });
    },
    
    loadSearchParams() {
      // First check URL parameters
      const params = new URLSearchParams(window.location.search);
      this.selectedCategory = params.get('category') || '';
      this.searchQuery = params.get('query') || '';
      
      // If no URL parameters, check localStorage
      if (!this.selectedCategory && !this.searchQuery) {
        const storedParams = localStorage.getItem('swiftThriftSearchParams');
        if (storedParams) {
          const parsedParams = JSON.parse(storedParams);
          this.selectedCategory = parsedParams.category || '';
          this.searchQuery = parsedParams.query || '';
          
          // Update URL for bookmarking/sharing
          this.updateUrl();
        }
      }
      
      // Now perform the actual search
      if (this.selectedCategory || this.searchQuery) {
        this.fetchSearchResults();
      } else {
        this.loadAllListings();
      }
    },
    
    updateUrl() {
      const newParams = new URLSearchParams();
      if (this.selectedCategory) newParams.set('category', this.selectedCategory);
      if (this.searchQuery) newParams.set('query', this.searchQuery);
      
      const newUrl = '/results' + 
          (newParams.toString() ? '?' + newParams.toString() : '');
      
      window.history.replaceState({}, '', newUrl);
    },
    
    fetchSearchResults() {
      this.loading = true;
      this.hasSearched = true;
      
      fetch(`/api/listings/search?category=${encodeURIComponent(this.selectedCategory)}&query=${encodeURIComponent(this.searchQuery)}`)
        .then(response => response.json())
        .then(data => {
          this.listings = data.listings || [];
          this.resultsCount = data.count || 0;
          this.loading = false;
        })
        .catch(error => {
          console.error('Error searching listings:', error);
          this.loading = false;
        });
    },
    
    loadAllListings() {
      this.loading = true;
      this.hasSearched = true;
      
      fetch('/api/listings')
        .then(response => response.json())
        .then(data => {
          this.listings = data.listings || [];
          this.resultsCount = data.count || this.listings.length;
          this.loading = false;
        })
        .catch(error => {
          console.error('Error loading listings:', error);
          this.loading = false;
        });
    },
    
    // Additional methods
    performNewSearch() {
      // Update stored params
      const searchParams = {
        category: this.selectedCategory,
        query: this.searchQuery,
        timestamp: new Date().getTime()
      };
      
      localStorage.setItem('swiftThriftSearchParams', JSON.stringify(searchParams));
      
      // Update URL without refreshing
      this.updateUrl();
      
      // Refresh results
      this.fetchSearchResults();
    },
    
    formatPrice(price) {
      return parseFloat(price).toFixed(2);
    },
    
    getSellerName(listing) {
      if (!listing.seller_firstName) return 'Unknown Seller';
      return `${listing.seller_firstName} ${listing.seller_lastName ? listing.seller_lastName.charAt(0) + '.' : ''}`;
    }
  };
}