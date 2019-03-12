      if(this.parent) {
        setTimeout(() => {
          this.event_close(event);
        }, 10);
        return false;
      }