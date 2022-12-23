class APIFeatures {
  constructor(databaseQuery, queryParams) {
    this.databaseQuery = databaseQuery;
    this.queryParams = queryParams;
  }

  filter() {
    const queryParams = { ...this.queryParams };
    const paginationQueryParams = ['page', 'sort', 'limit', 'fields'];
    paginationQueryParams.forEach((param) => delete queryParams[param]);

    //advance filtering - express auto parse query params of fields[gte] = 10 to { fields: { gte: 10 } }
    let queryParamsString = JSON.stringify(queryParams);
    queryParamsString = queryParamsString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.databaseQuery = this.databaseQuery.find(JSON.parse(queryParamsString));

    return this; //so that we can chain the method of this class using the instance
  }

  sort() {
    if (this.queryParams.sort) {
      const sortBy = this.queryParams.sort.split(',').join(' ');

      this.databaseQuery = this.databaseQuery.sort(sortBy);
    } else {
      this.databaseQuery = this.databaseQuery.sort('createdAt');
    }

    return this;
  }

  fieldLimit() {
    if (this.queryParams.fields) {
      const fields = this.queryParams.fields.split(',').join(' ');

      this.databaseQuery = this.databaseQuery.select(fields);
    } else {
      this.databaseQuery = this.databaseQuery.select('-__v');
    }

    return this;
  }

  pagination() {
    const page = parseInt(this.queryParams.page, 10) || 1;
    const limit = parseInt(this.queryParams.limit, 10) || 5;
    const skip = (page - 1) * limit;

    this.databaseQuery = this.databaseQuery.skip(skip).limit(limit);

    return this;
  }

  getDatabaseQuery() {
    return this.databaseQuery;
  }
}

module.exports = APIFeatures;
