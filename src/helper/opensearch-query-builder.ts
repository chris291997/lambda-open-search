export class OpenSearchQueryBuilder {
    private must: any[] = [];
    private filter: any[] = [];
    private query: any = {};
  
    public addMustTerm(field: string, value: any): OpenSearchQueryBuilder {
      this.must.push({ term: { [field]: value } });
      return this;
    }
  
    public addMustMatch(field: string, value: any): OpenSearchQueryBuilder {
      this.must.push({ match: { [field]: value } });
      return this;
    }
  
    public addFilterMatch(field: string, value: any): OpenSearchQueryBuilder {
      this.filter.push({ match: { [field]: value } });
      return this;
    }
  
    public addFilterRange(field: string, gte: any): OpenSearchQueryBuilder {
      this.filter.push({ range: { [field]: { gte } } });
      return this;
    }
  
    public setSize(size: number): OpenSearchQueryBuilder {
      this.query.size = size;
      return this;
    }
  
    public setFrom(from: number): OpenSearchQueryBuilder {
      this.query.from = from;
      return this;
    }
  
    public setSort(field: string, order: 'asc' | 'desc'): OpenSearchQueryBuilder {
      this.query.sort = [{ [field]: order }];
      return this;
    }
  
    public setAggregation(groupByField: string, limitNumber: number, pageNumber: number): OpenSearchQueryBuilder {
      this.query.size = 0;
  
      if (groupByField === 'provider') {
        this.query.aggs = {
          group_by_provider: {
            terms: {
              script: {
                source: `
                  def providerName = doc.containsKey('providerProfile.name') ? doc['providerProfile.name'].toString() : null;
                  def providerId = doc.containsKey('providerProfile.id') ? doc['providerProfile.id'].value : null;
                  def key = providerName + (providerId != null ? providerId : "");
                  return key;
                `,
                lang: 'painless',
              },
              order: {
                _key: 'asc',
              },
              size: limitNumber * pageNumber,
            },
            aggs: {
              top_hits: {
                top_hits: {
                  size: 1,
                },
              },
            },
          },
        };
      } else if (groupByField === 'project') {
        this.query.aggs = {
          group_by_project: {
            terms: {
              script: {
                source: `
                  def projectId = doc.containsKey('projectId') && doc['projectId'].size() > 0 ? doc['projectId'].value : null;
                  return projectId;
                `,
                lang: 'painless',
              },
              order: {
                _key: 'asc',
              },
              size: limitNumber * pageNumber,
            },
            aggs: {
              top_hits: {
                top_hits: {
                  size: 1,
                },
              },
            },
          },
        };
      } else if (groupByField === 'tin') {
        this.query.aggs = {
          group_by_tin: {
            terms: {
              script: {
                source: `
                  def tin = doc.containsKey('practitioner.tin') && doc['practitioner.tin'].size() > 0 ? doc['practitioner.tin'].value : null;
                  return tin;
                `,
                lang: 'painless',
              },
              order: {
                _key: 'asc',
              },
              size: limitNumber * pageNumber,
            },
            aggs: {
              top_hits: {
                top_hits: {
                  size: 1,
                },
              },
            },
          },
        };
      }
  
      return this;
    }
  
    public build(): any {
      if (!this.query.aggs) {
        if (this.must.length > 0 || this.filter.length > 0) {
          this.query.query = {
            bool: {},
          };
  
          if (this.must.length > 0) {
            this.query.query.bool.must = this.must;
          }
  
          if (this.filter.length > 0) {
            this.query.query.bool.filter = this.filter;
          }
        } else {
          this.query.query = { match_all: {} };
        }
      }
  
      return this.query;
    }
  }