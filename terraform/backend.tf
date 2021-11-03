terraform {
  backend "gcs" {
    bucket = "xdev-tfstate"
    prefix = "star/cluster"
  }
}
