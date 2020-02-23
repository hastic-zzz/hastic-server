.PHONY: rpm deb

all: rpm deb

rpm_node8:
	docker run --rm -it -v `pwd`/server:/root/rpmbuild/server \
			-v `pwd`/analytics:/root/rpmbuild/analytics \
			-v `pwd`/.git:/root/rpmbuild/.git \
			-v `pwd`/build/rpmbuild:/root/rpmbuild/rpm \
			-v `pwd`/dist/RPMS_8:/root/rpmbuild/RPMS \
			-e "NODE_VERSION=v8.0.0" \
			-e "RPM_NODE_VERSION=8" \
			-e "HASTIC_RELEASE_VERSION=`cat server/package.json| jq -r .version | sed 's/-/_/g'`" \
			hastic/rpmbuilder rpmbuild -bb rpm/hastic-server.spec

rpm_node6:
	docker run --rm -v `pwd`/server:/root/rpmbuild/server \
			-v `pwd`/analytics:/root/rpmbuild/analytics \
			-v `pwd`/.git:/root/rpmbuild/.git \
			-v `pwd`/build/rpmbuild:/root/rpmbuild/rpm \
			-v `pwd`/dist/RPMS_6:/root/rpmbuild/RPMS \
			-e "NODE_VERSION=v6.14.0" \
			-e "RPM_NODE_VERSION=6" \
			-e "HASTIC_RELEASE_VERSION=`cat server/package.json| jq -r .version | sed 's/-/_/g'`" \
			hastic/rpmbuilder rpmbuild -bb rpm/hastic-server.spec

rpm: rpm_node8 rpm_node6
