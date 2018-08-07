var Util = {
    
    empty(data) {
        if (typeof(data) == 'number' || typeof(data) == 'boolean') {
            return false;
        }
        if (typeof(data) == 'undefined' || data === null) {
            return true;
        }
        if (typeof(data.length) != 'undefined') {
            return data.length == 0;
        }
        var count = 0;
        for (var i in data) {
            if (data.hasOwnProperty(i)) {
                count++;
            }
        }
        return count == 0;
    },
  
    /**
      Checks if a String is a valid URL.
      @param {String} url - URL string to be checked if it is a valid url
      @return {boolean} result - valid or invalid
     **/
    IsURL(url) {
        var strRegex = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/
        var re = new RegExp(strRegex);
        return re.test(url);
     },
  
    /**
      Checks if a String starts with http or https and is a valid URL.
      @param {String} url - URL string to be checked if it is a valid url
      @return {boolean} result - valid or invalid
     **/
    urlChecker(url) {
      if (url.startsWith("http") || url.startsWith("https")) {
        return this.IsURL(url) ? true : false;
      } else {
        return false;
      }
    },
  
    isNumeric(num) {
        return !isNaN(num);
    },
  
    /**
     * Converts the Current Date and Time in MySQL datetime format.
     * Converts to UTC.
     */
    getCurrentDateTimeinUTCForMySQL() {
      return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
  
  };
  
  export = Util;